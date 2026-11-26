# cric-c2-l006 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C2.json, SHA7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23. Letti individualmente soltanto enunciati e metadati allowlist, insieme alle lezioni C2-L006–L010 e ai loro prerequisiti reali. Nessuna risposta, opzione, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche prima dei candidati: B sui cinquanta A001–050, commit9dc54dba, SHA34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; A sui cinquanta B051–100, commit026127465e30476b3e8bdb874d9bd98520a0b8d2, SHAa51ecd2856370b38a67fd59f09b4dbce23eda319c27e5d379428b9fd67b1dc92. La primaria A è stata ricevuta soltanto come hash/percorso e non aperta durante l’autoria. Modello B per futura review A congelato in e37686eb, SHA02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc, prima di aprire qualunque candidato A C2.

Sono dieci problemi differenti, non sedici variazioni di una famiglia artificiale. ID, corso, skill, famiglia, difficoltà, prerequisiti, ordine, flag exam e versione individuale originali conservati. Nuova version=baseVersion+1. Procedura manuale esatta, ipotesi fisiche e distrattori scritti per ciascun compito.

Unico assembler/importatore canonico; nessuna seconda ETL. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file helper è copiato byte-esatto per l’esecuzione e non attribuito a questa autoria.

Due assembly effettive identiche e import canonico entro il budget originale60 s: dieci salvati DRAFT, poi zero salvati/dieci invariati in SQLite temporaneo. I991 pubblicati e tutti i live head storici restano byte-invariati. Operazioni reali terminali0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto insieme all’XML: prova asset-only, non UI prodotto. Nessuna propria review scientifica, approvazione umana o pubblicazione: SCI/UI prodotto/human NOT_RUN, DRAFT.

## C2-Q051 — Restringere senza cambiare la portata

Versione 2, base 1; famiglia una-stenosi-idealizzata; difficoltà 2.

Modello e passaggi: La stazionarietà rende la portata costante nel tempo; l’incomprimibilità la rende uguale nelle due sezioni. Poiché A diminuisce, Q=Av richiede una velocità maggiore. Alla stessa quota Bernoulli conserva p+ρv²/2: l’aumento del contributo cinetico è compensato da una diminuzione della pressione statica. Il ragionamento riguarda questo modello, non una misura in un vaso reale.

Leggi e calcolo manuale: A_1v_1=A_2v_2;  A_2<A_1;  v_2>v_1;  p_2-p_1=-\frac{\rho}{2}(v_2^2-v_1^2)<0

Risposta d’autore proposta: La velocità aumenta e la pressione statica diminuisce.

Distrattori e limiti: La stazionarietà non impone uguale velocità in posizioni diverse. Aumentare anche p violerebbe il bilancio senza una macchina che fornisca energia. La pressione che cala non indica da sola una dissipazione: qui il contributo cinetico cresce.

## C2-Q052 — Recupero ideale in una dilatazione

Versione 2, base 1; famiglia una-dilatazione-ideale; difficoltà 2.

Modello e passaggi: La quota comune elimina il termine gravitazionale. Scrivo la pressione finale meno l’iniziale come ρ(v₁²−v₂²)/2: il rallentamento lascia più contributo di pressione statica. La differenza dei quadrati è 4−1=3 m²/s²; metà della densità è 500 kg/m³. Il prodotto dà un aumento di 1500 Pa.

Leggi e calcolo manuale: p_2-p_1=\frac{\rho}{2}(v_1^2-v_2^2);  v_1^2-v_2^2=3\,\mathrm{m^2/s^2};  p_2-p_1=1500\,\mathrm{Pa}

Risposta d’autore proposta: 1500 Pa.

Distrattori e limiti: −1500 Pa scambia pressione finale e iniziale. 500 Pa usa il quadrato della differenza delle velocità, che qui vale 1, invece della differenza dei quadrati. 3000 Pa omette il fattore 1/2.

## C2-Q053 — Salire mantenendo la velocità

Versione 2, base 1; famiglia una-salita-a-velocita-invariata; difficoltà 2.

Modello e passaggi: Le energie cinetiche per unità di volume si cancellano, ma non il contributo di quota. Salendo, ρgz aumenta e la pressione deve diminuire della stessa quantità. Porto 0,75 a 3/4: 800·10·3/4=6000 Pa. La richiesta è il modulo della diminuzione; la differenza p₂−p₁ sarebbe invece −6000 Pa.

Leggi e calcolo manuale: p_1-p_2=\rho g(z_2-z_1);  z_2-z_1=\frac34\,\mathrm m;  p_1-p_2=6000\,\mathrm{Pa}

Risposta d’autore proposta: 6000 Pa.

Distrattori e limiti: Zero considera soltanto l’uguaglianza delle velocità. Un aumento di 6000 Pa invertirebbe il ruolo della quota. 600 Pa omette g; 8000 Pa usa un metro intero anziché 3/4 m.

## C2-Q054 — Dalla pressione di ristagno alla velocità

Versione 2, base 1; famiglia fermare-una-linea-di-corrente; difficoltà 2.

Modello e passaggi: Nel punto di ristagno la velocità è zero. La pressione in eccesso corrisponde al contributo cinetico della corrente: Δp=ρv²/2. Isolo prima il quadrato: v²=120/(6/5)=100 m²/s². Prendo la radice positiva perché si chiede una rapidità, ottenendo 10 m/s.

Leggi e calcolo manuale: \Delta p=\frac12\rho v^2;  v^2=\frac{2\Delta p}{\rho};  v^2=100\,\mathrm{m^2/s^2};  v=10\,\mathrm{m/s}

Risposta d’autore proposta: 10 m/s.

Distrattori e limiti: 100 è il valore numerico di v², con unità diverse. √50 m/s ometterebbe il fattore 2 nel bilancio; una velocità negativa non è la rapidità richiesta. Non si può dividere 60 Pa per la sola densità e chiamare il risultato velocità.

## C2-Q055 — Quando la pressione cala senza accelerare

Versione 2, base 1; famiglia dove-la-formula-ideale-fallisce; difficoltà 2.

Modello e passaggi: L’uguaglianza di velocità e quota non lascia un aumento cinetico o gravitazionale a cui attribuire il calo di pressione. Nel tubo reale le azioni viscose trasformano energia meccanica in energia interna. La differenza di pressione compie il lavoro che sostiene il flusso dissipativo; il Bernoulli ideale senza perdite non descrive da solo questa situazione.

Leggi e calcolo manuale: \Delta p=p_1-p_2>0;  Q>0;  P_{\rm diss}=\Delta p\,Q>0

Risposta d’autore proposta: Dissipazione viscosa di energia meccanica.

Distrattori e limiti: La sezione uniforme non accelera la velocità media stazionaria; il tubo orizzontale non cambia quota. L’energia totale non viene creata né distrutta: cambia forma. Le pressioni compiono lavoro, che qui è necessario per compensare le perdite.

## C2-Q056 — Ricavare il rapporto delle aree

Versione 2, base 1; famiglia stimare-il-rapporto-di-sezioni; difficoltà 3.

Modello e passaggi: Bernoulli fornisce prima la nuova velocità: v₂²=v₁²+2(p₁−p₂)/ρ=1+3=4 m²/s². Per il flusso assegnato scelgo v₂=2 m/s. Poi la continuità dà A₁/A₂=v₂/v₁=2. La sezione finale è metà dell’iniziale, non quattro volte più piccola.

Leggi e calcolo manuale: v_2^2=v_1^2+\frac{2(p_1-p_2)}{\rho};  v_2^2=4\,\mathrm{m^2/s^2};  v_2=2\,\mathrm{m/s};  \frac{A_1}{A_2}=\frac{v_2}{v_1};  \frac{A_1}{A_2}=2

Risposta d’autore proposta: 2 1.

Distrattori e limiti: Quattro è il rapporto dei quadrati delle velocità, non quello delle aree. 1/2 inverte A₁/A₂. Uno ignorerebbe la variazione di pressione e di velocità; una sezione maggiore a valle richiederebbe un rallentamento.

## C2-Q057 — Dare un nome al punto fermo della corrente

Versione 2, base 1; famiglia il-punto-in-cui-la-velocita-si-annulla; difficoltà 1.

Modello e passaggi: Il termine ristagno descrive l’annullamento locale della velocità rispetto all’ostacolo. Non significa che tutto il fluido sia fermo. Alla stessa quota e senza perdite, la pressione di ristagno supera quella statica della corrente del contributo ρv²/2; la densità non deve annullarsi.

Leggi e calcolo manuale: v_{\rm ristagno}=0;  p_0=p+\frac12\rho v^2

Risposta d’autore proposta: Punto di ristagno.

Distrattori e limiti: Ebollizione è un cambiamento di fase e non segue dalla velocità nulla. Il punto non è di pressione minima nel modello considerato. Nodo elettrico e densità zero non definiscono il comportamento cinematico richiesto.

## C2-Q058 — Il recupero reale dopo un allargamento

Versione 2, base 1; famiglia limite-nel-modello-di-aneurisma; difficoltà 2.

Modello e passaggi: Il modello ideale attribuisce tutto il calo del contributo cinetico a un recupero di pressione se la quota non cambia. Separazione, mescolamento e viscosità introducono invece una perdita meccanica positiva. La pressione può ancora recuperare, ma meno della stima ideale a parità dei dati del confronto. Non si deduce un valore clinico dal solo schema.

Leggi e calcolo manuale: p_2-p_1=\frac{\rho}{2}(v_1^2-v_2^2)-\Delta p_{\rm perdita};  \Delta p_{\rm perdita}>0

Risposta d’autore proposta: Una parte dell’energia meccanica si dissipa nei moti reali.

Distrattori e limiti: La dissipazione non viola la conservazione dell’energia totale. Non richiede densità nulla né gravità invertita. Pressione costante non segue dal solo rallentamento: occorre il bilancio con le perdite.

## C2-Q059 — Quadruplicare il battente

Versione 2, base 1; famiglia cambiare-laltezza-del-serbatoio; difficoltà 2.

Modello e passaggi: La legge di Torricelli è v²=2gh, ottenuta fra superficie e foro con la stessa pressione atmosferica. A battente quadruplicato il quadrato della rapidità quadruplica, quindi la rapidità raddoppia. Partendo da 2 m/s si ottengono 4 m/s. Non si suppone che il livello resti fisso durante lo svuotamento: si confrontano due stati istantanei.

Leggi e calcolo manuale: \frac{v_B^2}{v_A^2}=\frac{h_B}{h_A};  \frac{h_B}{h_A}=4;  \frac{v_B}{v_A}=2;  v_B=4\,\mathrm{m/s}

Risposta d’autore proposta: 4 m/s.

Distrattori e limiti: 8 m/s applicherebbe una dipendenza lineare dal battente. 2 m/s ignorerebbe il nuovo stato; 1 m/s invertirebbe il fattore. I valori negativi non sono moduli di velocità.

## C2-Q060 — Sottrarre due energie cinetiche

Versione 2, base 1; famiglia differenza-di-quadrati; difficoltà 2.

Modello e passaggi: Bernoulli contiene il quadrato di ciascuna velocità. Portando i termini di pressione da un lato e quelli cinetici dall’altro si ottiene la differenza v₂²−v₁². Il quadrato di una differenza conterrebbe anche un termine misto e non cambia segno scambiando le sezioni: non può rappresentare questa differenza di pressione.

Leggi e calcolo manuale: p_1+\frac12\rho v_1^2=p_2+\frac12\rho v_2^2;  p_1-p_2=\frac{\rho}{2}(v_2^2-v_1^2)

Risposta d’autore proposta: p₁−p₂=ρ(v₂²−v₁²)/2.

Distrattori e limiti: Invertire l’ordine dei quadrati cambia il segno di p₁−p₂. Il quadrato della somma non si annulla per velocità uguali. La sola differenza delle velocità ha dimensione diversa da una pressione dopo la moltiplicazione per ρ.
