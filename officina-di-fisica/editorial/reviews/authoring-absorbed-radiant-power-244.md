# Authoring DRAFT — absorbed-radiant-power-244

Tutti gli 80 prompt originali A240–244 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U7-01. Fonte Git immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U7-01 SHA256 609dec0246ff1cd1b89afed2ea7258c0f65ff8e853735ce9196fe24829fc1233. Ogni caso autonomo è conservato, senza imporre il modello numerico comune: frequenza all’interfaccia 24003, velocità di fase 24004, ordinamento fotonico 24103, soglia a un fotone 24203 e geometria EM 24303. Conteggi N interi e tassi medi sono distinti. Le unità di misura scalate non sono confuse con quantità adimensionali: ogni coefficiente numerico è definito dalla normalizzazione.

Prima di qualunque candidato sono state congelate entrambe le primarie. B per A240–244: SHA 8771a65b67207b7b6f31618ba4ebc9cf17d99b55162f75f4c776cb0f327c975d su 8a82a32527171b68346cf30a933552b2a5f9366f, mai aperta dall’autore. A per B245–249: SHA 6ead7521b5a47b0f1cfa8675ca614070ef3c285b5b0be2815d82b299c3b26e08 su b3932757. Nessuna opzione, chiave, soluzione, SVG o modulo autore B245–249 letto durante l’autoria A.

Lettura integrale delle lezioni reali C5-L06 e C5-L07 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d: interfaccia stazionaria, campi EM, energia per fotone, potenza e frazione trasmessa. Primaria C5-L06 per 240/243 e C5-L07 per 241/242/244; prerequisiti reali del catalogo. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Import canonico ROOT in sola lettura su SQLite temporaneo: 16 nuovi e poi 0 nuovi/16 invariati; 991 pubblicati e storico conservati. Non è una seconda pipeline e non attribuisce credito di integrazione o SCI.

Asset SVG-only realmente renderizzato in browser nativo, XML e PNG completo effettivamente letti dopo exit 0 reale del processo. Mutex condiviso e guardia ≥2 GiB rispettati. Nessuna UI prodotto locale: test a 320px e relativo marker NOT_RUN e riservati al runner canonico. I testi visibili mostrano grandezze fisiche, non pixel o altre metriche ingegneristiche.

## AR-u7-absorbed-radiant-power-01 — Dove va la potenza non trasmessa

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Con P₀=8 W e τ=1/2, quanto vale P_ass in W?

Procedimento d’autore: La potenza trasmessa è τP₀=4 W. Sottraendola agli 8 W incidenti resta P_ass = 4 W. In questo bilancio senza altri canali la frazione assorbita è 1−τ, non τ per definizione: i due valori coincidono soltanto perché qui τ=1/2.

Formule: P_{\rm trasm}=\tau P_0;  P_{\rm ass}=P_0(1-\tau);  P_{\rm ass}=4\,\mathrm W.

Distrattori e controprove: Otto W assorbe tutta la potenza ignorando la trasmissione. Sedici W divide per τ e supera l’ingresso; zero ignora l’assorbimento. Non basta moltiplicare sempre per τ: a una trasmittanza diversa da 1/2 darebbe la potenza trasmessa, non quella assorbita.

Hint: Calcola prima la parte trasmessa, poi sottraila da P₀.

Fonte SHA256 f5defd5aaed6ad556ee576cc65cf3dbefdc4d28cc1815378b8fcc075f07ff59a. Candidato SHA256 a398a30b013de21b4870f9cfed4c928f84e1958c68e2f8d5bc460630a8ae8172. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-02 — La dimensione del risultato

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Quale unità è dimensionalmente adatta a P_ass?

Procedimento d’autore: La potenza assorbita è una quota della potenza incidente e ha unità watt. τ e 1−τ sono pure e non ne cambiano la dimensione. Per conoscere un’energia servirebbe anche un intervallo e l’integrale della potenza.

Formule: [P_{\rm ass}]=\mathrm W;  [\tau]=1.

Distrattori e controprove: J è energia, W/m² intensità e s tempo. Il simbolo 1 è adatto alla trasmittanza, non a P_ass. Non si elimina il watt formando una frazione della potenza incidente.

Hint: Un fattore puro conserva l’unità di P₀.

Fonte SHA256 e1f747ffd9d6fa69705069e1dbe2053851d3bae7969b90e4a9940aebcd602093. Candidato SHA256 6b238afe030143b6358eddea308f1e6fe2d7bf09a0d0b38616e484e2fbebee03. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-03 — La frazione assorbita è il complemento

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Quale espressione fornisce P_ass?

Procedimento d’autore: Il bilancio è P_ass=P₀−P_trasm. La definizione di trasmittanza dà P_trasm=τP₀, perciò P_ass=P₀(1−τ). Con 0<τ<1 la potenza assorbita è positiva e minore di P₀. La formula è un bilancio del modello dichiarato, non vale aggiungendo tacitamente riflessione o emissione.

Formule: P_{\rm ass}=P_0-P_{\rm trasm};  P_{\rm ass}=P_0(1-\tau);  0<P_{\rm ass}<P_0.

Distrattori e controprove: P₀τ è la trasmessa. Le espressioni P₀/τ e P₀(1+τ) superano l’ingresso nel dominio dato; τ/P₀ ha dimensione di potenza inversa. La coincidenza numerica a τ = 1/2 non rende uguali le due leggi generali.

Hint: Sottrai la frazione che esce, non sommarla.

Fonte SHA256 b003612e3e5afe09ce7be1353b9582ff320dfef19c487e4344ac28feb9620540. Candidato SHA256 5aabc179891479401bc37ef92f383cbea12673edb90ba1d491c75e7c043938a7. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-04 — Più potenza con la stessa frazione

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. τ resta 1/2 e P₀ passa da 8 a 12 W. Come cambia P_ass?

Procedimento d’autore: Il fattore assorbito 1−τ resta 1/2. La potenza assorbita passa da 8/2=4 W a 12/2=6 W, lo stesso rapporto 3/2 dell’ingresso. La trasmittanza non è cambiata.

Formule: P_{{\rm ass},A}=4\,\mathrm W;  P_{{\rm ass},B}=6\,\mathrm W;  P_{{\rm ass},B}/P_{{\rm ass},A}=\frac32.

Distrattori e controprove: 8/3 W inverte la proporzione; 9 W introduce il quadrato del fattore 3/2. Dodici assorbe tutto l’ingresso e quattro ignora il nuovo valore.

Hint: Mantieni fisso il complemento 1−τ.

Fonte SHA256 8bfa2f5723895efa30c53078728d40f8c1c0dc3228b5cea227bd1311e3a0474a. Candidato SHA256 e75f66a433ff22a79cc3a91b721342899e9cdbbf89f434f5c9c752dcb591feb4. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-05 — La potenza incidente dall’assorbita

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. P_ass=4 W e τ=1/2. Quanto vale P₀ in W?

Procedimento d’autore: Divido P_ass=P₀(1−τ) per il fattore positivo 1−τ. P₀=4/(1/2)=8 W. Il risultato è maggiore di P_ass perché una parte viene trasmessa.

Formule: P_0=\frac{P_{\rm ass}}{1-\tau};  P_0=8\,\mathrm W.

Distrattori e controprove: Due W moltiplica ancora per 1/2 e sarebbe inferiore all’assorbita. Quattro W ignora la quota trasmessa; sedici W darebbe 8 W assorbiti. Il caso τ = 1 è escluso perché annullerebbe il denominatore.

Hint: Controlla che P₀ ricavata sia maggiore di P_ass.

Fonte SHA256 11fe29f3c86866415dccf3a8594e333d87bec24bf41e109842206ecfb42b0aa1. Candidato SHA256 74a416628e699119801274cd7bdee6fb2536b45f14e95df6e4b6d370cf60ff04. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-06 — La trasmittanza dal bilancio

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. P_ass=4 W e P₀=8 W. Quanto vale τ?

Procedimento d’autore: Divido per P₀: P_ass/P₀=1−τ. Porto τ al primo membro e ottengo τ=1−P_ass/P₀=1−1/2=1/2, nel dominio 0<τ<1. In questo dato la frazione trasmessa coincide con l’assorbita, ma la relazione inversa deve conservare il complemento.

Formule: \tau=1-\frac{P_{\rm ass}}{P_0};  \tau=\frac12.

Distrattori e controprove: Due inverte il rapporto e viola il dominio. Zero e uno sono confini esclusi: corrisponderebbero rispettivamente a tutta o nessuna potenza assorbita. Il rapporto P_ass/P₀ da solo non è sempre τ.

Hint: Ricava prima la frazione assorbita, poi il suo complemento.

Fonte SHA256 a57d000a6b01156461e73ad311f1b371336a707f8d2c94096abc056ba37f7133. Candidato SHA256 9dfd6713fae2a38c04a6938c09fb1b5e573efad5ebaa6d93433cae211c94391f. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-07 — Minore trasmissione, più assorbimento

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. A usa P₀=8 W,τ=1/2. B mantiene P₀ e usa τ=1/4. Quanto vale P_ass,B/P_ass,A?

Procedimento d’autore: A assorbe 4 W. In B la parte trasmessa scende a 2 W e quella assorbita sale a 6 W. Il rapporto è 6/4=3/2. τ dimezzata non significa assorbimento dimezzato, perché conta 1−τ.

Formule: P_{{\rm ass},A}=4\,\mathrm W;  P_{{\rm ass},B}=6\,\mathrm W;  P_{{\rm ass},B}/P_{{\rm ass},A}=\frac32.

Distrattori e controprove: 2/3 inverte il confronto. 1/2 copia il rapporto delle trasmittanze e due il suo reciproco. Uno ignora il complemento diverso.

Hint: Calcola il complemento di ciascuna trasmittanza.

Fonte SHA256 d1e0304c7e43b696c3b83a7f1da4ed8ce11cc1349f58568147293db761fdf798. Candidato SHA256 89ac16baa27b43952db9195d1b0cea17b32c3705395ba9a28df7bed6e8409b56. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-08 — Lo scarto di una proposta troppo grande

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Con P₀=8 W,τ=1/2 si propone P_ass=8 W. Quanto vale proposta meno corretto?

Procedimento d’autore: La legge del bilancio dà 4 W assorbiti. La proposta supera il corretto di 8−4=4 W. Non si sottrae la trasmittanza pura direttamente a una potenza.

Formule: P_{\rm ass}=4\,\mathrm W;  \delta P=(8-4)\,\mathrm W;  \delta P=4\,\mathrm W.

Distrattori e controprove: −4 W scambia l’ordine; due è il rapporto puro; otto copia la proposta e zero la accetta. Lo scarto non è una frazione assorbita.

Hint: Mantieni il watt dopo la sottrazione.

Fonte SHA256 17a76f4afdd656b1ea218bf55853eaf6a8afc9736dc0f2499309ebc8a8599416. Candidato SHA256 973d3fd5791eff29e3a34eca80e2020cc1387b9f930b5839dba809a79d4999fd. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-09 — L’inversa simbolica della potenza incidente

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. P_ass e τ sono noti. Quale formula isola P₀?

Procedimento d’autore: La frazione 1−τ è strettamente positiva. Dividendo il bilancio per essa si ottiene P₀=P_ass/(1−τ), con unità watt e valore maggiore di P_ass. Il dominio evita la divisione per zero e la creazione di un ingresso negativo.

Formule: P_0=\frac{P_{\rm ass}}{1-\tau};  P_0>P_{\rm ass}.

Distrattori e controprove: Moltiplicare per 1−τ ripete una riduzione invece dell’inversa. Dividere per τ confonde trasmessa e assorbita e coincide soltanto nel dato particolare τ = 1/2. Il reciproco ha W⁻¹; P_ass−τ sottrae grandezze di dimensione diversa.

Hint: Il denominatore è la frazione assorbita.

Fonte SHA256 c87f90390aac080ffe079cc304a2b3bd03bb5b16879221dbd4e18e891b53cc17. Candidato SHA256 bb80c3530256cf13ac087610aeab02a1f1bed4c15749196030591930e878ff30. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-10 — Due variazioni con un complemento

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Fra preparazioni P₀,B=κ₁P₀,A e τ_B=κ₂τ_A. I fattori sono positivi ed entrambe le trasmittanze sono fra 0 e 1. Quanto vale P_ass,B/P_ass,A?

Procedimento d’autore: Sostituisco prima nel bilancio di B: P_ass,B=κ₁P₀,A(1−κ₂τ_A). Divido per P₀,A(1−τ_A) e cancello P₀,A. Indico con R il rapporto P_ass,B/P_ass,A: resta R=κ₁(1−κ₂τ_A)/(1−τ_A). Occorre anche κ₂τ_A<1, non basta che i fattori siano positivi.

Formule: R=\kappa_1\frac{1-\kappa_2\tau_A}{1-\tau_A}.

Distrattori e controprove: Il prodotto o il quoziente dei soli fattori ignorano il complemento. Il reciproco scambia A e B; la somma non restituisce uno per preparazioni identiche. Non si estende τ_B fuori dal suo dominio.

Hint: Calcola 1−τ_B prima di formare il rapporto.

Fonte SHA256 e75feaef5a149121b832cc588e7b253463d681b128efe09b0b48d784f85ab518. Candidato SHA256 03180a2b70641aa9be5d8ee7f8a7b61c88b4fcd9789dfc41e34e2e12462600b7. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-11 — Potenza maggiore e trasmittanza minore

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. A ha P₀=8 W,τ=1/2. B ha P₀=12 W,τ=1/4. Quanto vale P_ass,B/P_ass,A?

Procedimento d’autore: A assorbe 8·1/2=4 W. B assorbe 12·3/4=9 W. Il rapporto è 9/4: cresce sia l’ingresso sia la frazione assorbita. Non si usa direttamente il rapporto delle trasmittanze.

Formule: P_{{\rm ass},A}=4\,\mathrm W;  P_{{\rm ass},B}=9\,\mathrm W;  P_{{\rm ass},B}/P_{{\rm ass},A}=\frac94.

Distrattori e controprove: 4/9 inverte il rapporto, 3/2 segue solo P₀, 1/2 solo τ. 3/4 moltiplica il rapporto degli ingressi per quello delle trasmittanze, cioè confronta le potenze trasmesse.

Hint: Usa 1/2 e 3/4 come frazioni assorbite.

Fonte SHA256 7635c6d81ce716176d786e3e8b972ac804db3f95c1f4f4da9f1d3f4a6272bdaf. Candidato SHA256 d10037d79bae3f2d2132d4df2cc29dfa66ca4d339f43a1c7e93b9419a8688465. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-12 — Media delle potenze assorbite

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. A usa P₀=8 W,τ=1/2; B usa P₀=12 W,τ=1/4. Qual è la media aritmetica di P_ass?

Procedimento d’autore: Le uscite sono 4 e 9 W: media (4+9)/2=13/2 W. Ai dati medi P₀ = 10 W, τ = 3/8, il modello darebbe 10·5/8=25/4 W. Indico con P_m il modello valutato ai dati medi. La media delle uscite è maggiore di 1/4 W. Sono due operazioni diverse su due prove distinte.

Formule: \overline P_{\rm ass}=\frac{4+9}{2}\,\mathrm W;  \overline P_{\rm ass}=\frac{13}{2}\,\mathrm W;  P_m=\frac{25}{4}\,\mathrm W.

Distrattori e controprove: 25/4 usa gli ingressi medi; 13 è la somma; 5/2 la semidifferenza e 9 solo B. Non si media τ per poi applicare automaticamente la stessa uscita media.

Hint: Calcola prima due complementi e due potenze assorbite.

Fonte SHA256 e41bd5947654023d7ceacfc583bdcd726eef938b1a970d6c01cecc67a210f90e. Candidato SHA256 de37b6dfe78f70127c211a314c01d8cdeee6d4de5fbafe82fec50d3cd45d794d. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-13 — La trasmittanza per l’assorbimento bersaglio

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. A ha P₀,A=8 W,τ_A=1/2. B usa P₀,B=12 W e deve avere P_ass,B=(9/4)P_ass,A. Quanto vale τ_B/τ_A?

Procedimento d’autore: Il bersaglio è 9 W assorbiti. Su 12 W incidenti è una frazione 3/4, quindi la trasmittanza deve essere 1−3/4=1/4. Rispetto a τ_A = 1/2 il rapporto è1/2. Il risultato rispetta 0<τ_B<1.

Formule: P_{{\rm ass},B}=9\,\mathrm W;  \tau_B=1-\frac9{12};  \tau_B=\frac14;  \tau_B/\tau_A=\frac12.

Distrattori e controprove: Due inverte il confronto; 9/4 copia il bersaglio delle potenze e 4/9 il suo reciproco. 3/2 è il rapporto delle frazioni assorbite, non delle trasmittanze.

Hint: Dalla frazione assorbita torna alla trasmittanza con un complemento.

Fonte SHA256 ffea834bc3c0f1d7b6c824058750a1930db72d6a9f7c4c730fe1e23dca5b8f7a. Candidato SHA256 a50fbb91d47b3a23bdb01dfb1ce2c0f5c3e282d092d34f6d63007c940d770163. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-14 — Tarare prima di ricavare l’ingresso

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. D=a_cal P_ass è continuo e adimensionale. A con P₀=8 W,τ=1/2 dà D = 12. B ha τ=1/4, D=27. Quanto vale P₀,B in W?

Procedimento d’autore: Il riferimento assorbe 4 W e fissa a_cal = 3 W⁻¹. D = 27 corrisponde a P_ass,B = 9 W. La nuova frazione assorbita è 3/4, quindi P₀,B=9/(3/4)=12 W. La lettura del display non è già una potenza.

Formule: a_{\rm cal}=3\,\mathrm W^{-1};  P_{{\rm ass},B}=9\,\mathrm W;  P_{0,B}=12\,\mathrm W.

Distrattori e controprove: 36 W tratta D come 27 W e predice D = 81. 9/4 W moltiplica 9 per la trasmittanza 1/4 anziché dividere per la frazione assorbita 3/4 e non soddisfa il bilancio. Otto W ripete A e darebbe D = 18.

Hint: Decodifica la potenza assorbita prima di dividere per 1−τ.

Fonte SHA256 1e786d64930bb779159bcf098ab35e79af3b500b765d71250b21aa35afcb069b. Candidato SHA256 a38582baf32da566d4db7c4f73091094b4a55dcc0f3ec6ea76e203e7f623d4c6. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-15 — Offset e guadagno prima del bilancio fisico

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. D=a_cal P_ass+b_cal è continuo. A: P₀=8 W,τ=1/2,D9. B: P₀=12 W,τ=1/4,D19. C: τ=1/2,D13. Quanto vale P₀,C in W?

Procedimento d’autore: I riferimenti assorbono4 e9 W. Guadagno (19−9)/(9−4)=2 W⁻¹ e offset 1. La lettura 13 indica P_ass,C=(13−1)/2=6 W. Con frazione assorbita 1/2 serve P₀,C = 12 W.

Formule: a_{\rm cal}=2\,\mathrm W^{-1};  b_{\rm cal}=1;  P_{{\rm ass},C}=6\,\mathrm W;  P_{0,C}=12\,\mathrm W.

Distrattori e controprove: 13 W omette l’offset e predice D = 14. 24 W sottrae b ma salta il guadagno; sei W copia la potenza assorbita senza l’inversa dell’ingresso. Si verifica 12·1/2=6 W e 2·6+1=13.

Hint: Le due potenze assorbite di riferimento sono diverse e identificano la taratura.

Fonte SHA256 c20df84ec9b6e0fc15ad25cd52a51768f7287fa7df7a6f635b960277e400254f. Candidato SHA256 2199548d89ce7a6dc9edcb73a24e41c0f67c85fbf78828c3081b99cd818655e3. Skill reale C5-L07. Review distinta e human NOT_RUN.

## AR-u7-absorbed-radiant-power-16 — Un massimo che seleziona una sola trasmittanza

Uno strato riceve potenza radiante P₀>0 e ne trasmette la frazione τ, con 0<τ<1. Qui τ è la trasmittanza, non una profondità ottica. Nel bilancio considerato sono trascurabili riflessione, emissione propria e altri canali radiativi: P₀=P_trasm+P_ass, con P_trasm=τP₀. Si cerca la potenza radiante assorbita, non l’energia assorbita in un intervallo. Le prove hanno dati finiti costanti e i confronti riguardano preparazioni distinte. Fra preparazioni P₀=(16 W)τ. Si misura P_ass=4 W. Quanto vale τ?

Procedimento d’autore: Sostituisco il vincolo nel bilancio: P_ass=(16 W)τ(1−τ). La misura dà τ(1−τ)=1/4, cioè (τ−1/2)²=0 dopo il completamento del quadrato. C’è una sola trasmittanza τ = 1/2, una radice doppia algebrica, con P₀ = 8 W. Non si contano due valori distinti per la molteplicità della radice.

Formule: \tau(1-\tau)=\frac14;  \left(\tau-\frac12\right)^2=0;  \tau=\frac12;  P_0=8\,\mathrm W.

Distrattori e controprove: 1/4 e 3/4 darebbero entrambe 3 W assorbiti nel vincolo, non 4. Due viola 0<τ<1. L’assorbimento vincolato vale 4 W−(16 W)(τ−1/2)² e raggiunge 4 W soltanto a τ = 1/2.

Hint: Completa il quadrato e distingui radice doppia da due soluzioni.

Fonte SHA256 3827c23c733c4bc44744956ac61c57f7ba9a61630219c32b843127fed425ab2b. Candidato SHA256 dcdb841ddae83ffd1f8bed805b7ece763b4a31799aba124676640b163ff435a9. Skill reale C5-L07. Review distinta e human NOT_RUN.

## Provenienza tecnica

Asset SHA256 c4c4b0d95da705f744e2d5a346ee81ba5085b13465b46b9c5c1e5002fa48d426. Package file SHA256 2e21b87972311aba0614882a06561fce012ec6d36fc766bd81b9310ccfe77583. Binding file SHA256 0f004d1b9ee4ba340cbb6728093798de812d244d2334e65cdc41e20b3b77806b. Strutturale SHA256 1db16a8585743be4b6cfed9ba9d08871369b4204c242ec4b24160517b8a3c2c9. Manifest asset-only SHA256 a01d951d806a5f30a480bdb72a2ba9b4bd647a40d5688981444bcc31ae3d8e1a.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B deve leggere questi finali contro la propria primaria distinta prima del congelamento scientifico.

Nota geometrica d’autore: nel primo pannello le barre ingresso, trasmissione e assorbimento hanno lunghezze intrinseche 320, 160 e 160, proporzionali a 8, 4 e 4 W. Nel secondo le due barre composte hanno identica lunghezza totale 320: segmenti 160+160 e 80+240 per le stesse potenze incidenti. Nel terzo le barre 128, 288 e 208 rappresentano 4, 9 e 13/2 W con origine e scala comuni. Queste sono coordinate tecniche dell’asset, non pixel effettivi della pagina responsive. La lettura completa XML e PNG nativo 640×1480 non ha mostrato sovrapposizioni di etichette o tagli. La verifica scientifica distinta e la UI prodotto restano NOT_RUN dall’autore.
