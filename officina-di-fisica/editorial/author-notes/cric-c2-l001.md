# cric-c2-l001

Dieci problemi Cric distinti; nessuna espansione in varianti. Fonte immutabile `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`. ID, famiglia, difficoltà e metadati protetti originali conservati; versione nuova = originale + 1, baseVersion originale.

Competenza e prerequisiti riletti nella lezione reale del medesimo pin. Assembler canonico unico, dipendenza esterna congelata 23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5; nessun secondo ETL.

Doppia assembly byte-identica e importatore canonico su SQLite temporaneo: 10 salvati, ripetizione 0/10, dieci live originali e 991 pubblicati/storico invariati. Immagine SVG-only completa letta dopo processo reale exit 0; non è un collaudo del prodotto. Review scientifica propria, approvazione umana e UI prodotto NOT_RUN; pubblicazione NONE.

## C2-Q001

Compito: In condizioni ordinarie un liquido e un solido elastico sono sottoposti a un piccolo sforzo tangenziale costante e non nullo. Quale comportamento distingue il liquido?

Procedimento: Uno sforzo tangenziale agisce parallelamente alla superficie. Un solido elastico può equilibrarlo con una deformazione finita. Il liquido ordinario invece scorre sotto il taglio persistente: non sostiene quello sforzo in un equilibrio statico. La piccolezza dello sforzo non lo trasforma in una sollecitazione soltanto normale.

Passaggi esatti: `\tau=F_{\parallel}/A\qquad \tau\ne0\qquad [\tau]=\mathrm{Pa}`.

Distrattori: La deformazione elastica finita descrive il solido nel regime assegnato. Un liquido può esercitare pressione e forza normale; scorrere non significa conservare la forma iniziale. La pressione non è una conversione automatica del taglio, né deve diventare negativa.

Aiuto: Confronta l’equilibrio finale del solido con ciò che accade al liquido mentre il taglio continua.

Famiglia: `uno-sforzo-tangenziale-persistente`; difficoltà 2; versione 2/base 1.

## C2-Q002

Compito: Una superficie di area 0,015 m² riceve una forza complessiva normale di 45 N, distribuita uniformemente. Qual è la pressione media in kPa?

Procedimento: La pressione media è la forza normale divisa per l’area. Scrivo 0,015=15/1000: dividere 45 per 15/1000 equivale a calcolare 3·1000. Risultano 3000 Pa. Mille pascal formano un kilopascal, perciò il valore richiesto è 3 kPa. L’uniformità fa coincidere il valore medio con quello locale.

Passaggi esatti: `p=\frac{F_\perp}{A}\qquad p=\frac{45}{15/1000}\,\mathrm{Pa}\qquad p=3000\,\mathrm{Pa}\qquad p=3\,\mathrm{kPa}`.

Distrattori: 0,675 deriva dal prodotto forza per area e non ha unità di pressione. 3000 kPa conserva il numero in pascal ma cambia l’unità senza convertirlo. 0,003 kPa aggiunge un fattore mille nella direzione sbagliata. 45 kPa copia soltanto il dato della forza.

Aiuto: Prima ottieni N/m², poi converti i pascal in kilopascal.

Famiglia: `una-pressione-media-al-contatto`; difficoltà 2; versione 3/base 2.

## C2-Q003

Compito: In un punto di un liquido in quiete la pressione assoluta è p. Una piccola parete di prova viene ruotata mantenendo il suo centro nello stesso punto. Nel modello idrostatico ideale che cosa accade?

Procedimento: La pressione idrostatica in un punto è uno scalare e non seleziona una direzione della parete. Per una piccola area la forza ha modulo pA e direzione normale alla superficie. Ruotando la parete cambia quindi la direzione della forza, mentre p resta lo stesso. L’area di prova è tanto piccola da trascurare la variazione di pressione al suo interno.

Passaggi esatti: `F_\perp=pA\qquad p_{\rm dopo}=p_{\rm prima}`.

Distrattori: Verticale e orizzontale non definiscono due pressioni diverse nello stesso punto. La forza non resta verticale se cambia la normale alla superficie; il peso del liquido non coincide con ogni singola forza di pressione. Una parete orizzontale riceve pressione e un liquido fermo ideale non presenta taglio statico.

Aiuto: Distingui il valore scalare della pressione dalla direzione della forza sulla superficie.

Famiglia: `ruotare-una-piccola-parete`; difficoltà 2; versione 2/base 1.

## C2-Q004

Compito: Un manometro misura −12 kPa rispetto all’atmosfera locale, la cui pressione assoluta è 99 kPa. Qual è la pressione assoluta della camera?

Procedimento: La lettura relativa è la differenza fra pressione della camera e pressione atmosferica. Per ricostruire la pressione assoluta sommo l’atmosfera alla lettura con il suo segno: 99+(−12)=87 kPa. Il segno negativo del manometro indica una camera sotto la pressione atmosferica, non sotto lo zero assoluto di pressione.

Passaggi esatti: `p_{\rm rel}=p_{\rm ass}-p_{\rm atm}\qquad p_{\rm ass}=p_{\rm atm}+p_{\rm rel}\qquad p_{\rm ass}=(99-12)\,\mathrm{kPa}\qquad p_{\rm ass}=87\,\mathrm{kPa}`.

Distrattori: 111 kPa sottrae una lettura già negativa e descriverebbe una sovrapressione. −12 kPa è la lettura relativa, non quella assoluta. 12 kPa ne prende soltanto il modulo; 99 kPa ignora il manometro. La pressione assoluta del gas nel modello resta positiva.

Aiuto: Scrivi la definizione della pressione relativa prima di sostituire il segno meno.

Famiglia: `un-sensore-con-riferimento-atmosferico`; difficoltà 2; versione 2/base 1.

## C2-Q005

Compito: Si uniscono 20 mL di liquido con densità 0,8 g/mL e 30 mL con densità 1,2 g/mL. Non si perde massa e i volumi sono additivi. Qual è la densità media finale?

Procedimento: Calcolo prima le masse: 20·0,8=16 g e 30·1,2=36 g. La massa totale è 52 g e, per l’ipotesi dichiarata, il volume finale è 50 mL. La densità media è 52/50=26/25=1,04 g/mL. I due liquidi non contribuiscono con volumi uguali, quindi non basta la media aritmetica delle loro densità.

Passaggi esatti: `m_1=16\,\mathrm g\qquad m_2=36\,\mathrm g\qquad \rho=\frac{m_1+m_2}{V_1+V_2}\qquad \rho=\frac{52}{50}\,\mathrm{g/mL}\qquad \rho=\frac{26}{25}\,\mathrm{g/mL}`.

Distrattori: 1,00 è la media semplice delle densità, valida per porzioni di volume uguale, che qui non sono date. 2,00 somma le densità anziché le masse. 0,96 moltiplica le densità e non ricostruisce 52 g in 50 mL. 52 è il valore numerico della massa totale in grammi, non della densità in g/mL.

Aiuto: Somma le masse calcolate separatamente e dividi per il volume totale dichiarato additivo.

Famiglia: `densita-di-un-composto-di-due-porzioni`; difficoltà 3; versione 2/base 1.

## C2-Q006

Compito: Quale aggettivo identifica una pressione espressa rispetto al vuoto?

Procedimento: Una pressione assoluta ha lo zero nel riferimento al vuoto. La pressione relativa usa invece una pressione di confronto, spesso l’atmosfera locale. Sono due modi di esprimere la pressione dello stesso stato, collegati dalla somma del riferimento atmosferico alla lettura relativa.

Passaggi esatti: `p_{\rm ass}=p_{\rm atm}+p_{\rm rel}`.

Distrattori: Relativa e differenziale richiedono un riferimento diverso dal vuoto indicato. Tangenziale descrive una direzione di sollecitazione, non il riferimento di pressione. Volumetrica non identifica questa distinzione. Una pressione relativa nulla può corrispondere a una pressione assoluta atmosferica non nulla.

Aiuto: Chiediti quale lettura avrebbe il proprio zero nel vuoto.

Famiglia: `il-riferimento-al-vuoto`; difficoltà 1; versione 2/base 1.

## C2-Q007

Compito: Una forza normale costante produce inizialmente una pressione media di 18 kPa su 4 cm². La stessa forza viene distribuita su 12 cm². Qual è la nuova pressione media?

Procedimento: A forza normale fissata il prodotto pA resta uguale. L’area diventa tre volte maggiore: 12/4=3. La pressione quindi si divide per tre, passando da 18 a 6 kPa. Le aree possono restare in cm² nel rapporto, perché la stessa unità si cancella.

Passaggi esatti: `p_1A_1=p_2A_2\qquad p_2=p_1\frac{A_1}{A_2}\qquad p_2=18\frac4{12}\,\mathrm{kPa}\qquad p_2=6\,\mathrm{kPa}`.

Distrattori: 54 kPa applica il rapporto diretto delle aree; con l’area tripla produrrebbe una forza nove volte maggiore. 18 kPa ignora il cambiamento dell’area. 2 kPa divide ancora per tre senza motivo. 72 copia il prodotto numerico iniziale pA e non lo divide per la nuova area.

Aiuto: Mantieni costante la forza, non la pressione: l’area cresce di un fattore tre.

Famiglia: `aumentare-la-superficie-di-appoggio`; difficoltà 2; versione 2/base 1.

## C2-Q008

Compito: Per un liquido omogeneo nello stesso stato si traccia la massa del solo liquido in funzione del volume dosato. Che cosa misura la pendenza della retta?

Procedimento: Il liquido omogeneo nello stesso stato segue m=ρV. Nel grafico con m in ordinata e V in ascissa la pendenza è Δm/ΔV, dunque ρ. La massa del contenitore è esclusa dal dato: la retta ideale passa per l’origine. Le unità della pendenza sono massa per volume.

Passaggi esatti: `m=\rho V\qquad \frac{\Delta m}{\Delta V}=\rho\qquad [\rho]=\mathrm{kg/m^3}`.

Distrattori: Il volume è la coordinata orizzontale, non la pendenza. La pressione non ha unità di massa per volume. L’inverso della densità sarebbe la pendenza del grafico V in funzione di m. La tara produrrebbe un’intercetta se fosse inclusa, ma qui si misura il solo liquido.

Aiuto: Leggi quali grandezze occupano l’asse verticale e quello orizzontale.

Famiglia: `il-grafico-massavolume`; difficoltà 2; versione 2/base 1.

## C2-Q009

Compito: Un gas chiuso ha densità iniziale 1,20 kg/m³ e volume iniziale 6,0 L. Viene compresso fino a 4,0 L senza perdite di materia. Qual è la densità finale?

Procedimento: La massa del gas resta uguale: ρ₁V₁=ρ₂V₂. Isolando ρ₂ ottengo ρ₁V₁/V₂. Il rapporto dei volumi è 6/4=3/2, quindi 1,20·3/2=1,80 kg/m³. Non serve assegnare una trasformazione termica: questa conclusione segue dalla sola conservazione della massa.

Passaggi esatti: `\rho_1V_1=\rho_2V_2\qquad \rho_2=\rho_1\frac{V_1}{V_2}\qquad \rho_2=\frac65\frac64\,\mathrm{kg/m^3}\qquad \rho_2=\frac95\,\mathrm{kg/m^3}`.

Distrattori: 0,80 usa il rapporto inverso dei volumi e farebbe diminuire la massa. 1,20 suppone densità invariata pur riducendo il volume a massa fissata. 7,20 moltiplica per il solo numero 6; 0,20 divide per il solo numero 6. Il gas non è stato assunto incomprimibile.

Aiuto: Scrivi la stessa massa all’inizio e alla fine; nel rapporto le unità L si cancellano.

Famiglia: `conservare-la-massa-comprimendo-un-gas`; difficoltà 2; versione 2/base 1.

## C2-Q010

Compito: Sulla faccia di una piastra agiscono contemporaneamente una forza normale e una forza tangenziale. Quale componente entra nella definizione della pressione media sulla faccia?

Procedimento: La pressione media descrive la sollecitazione normale per unità di area. La forza tangenziale dà invece uno sforzo di taglio. Anche se entrambe hanno unità N e i due rapporti hanno unità Pa, le direzioni rispetto alla faccia distinguono le due sollecitazioni. Non si sommano i moduli per ridefinire la pressione.

Passaggi esatti: `p_{\rm media}=F_\perp/A\qquad \tau_{\rm media}=F_\parallel/A`.

Distrattori: Il rapporto con la componente tangenziale è lo sforzo di taglio. La somma dei moduli confonde due componenti geometricamente diverse. Il prodotto delle forze ha unità N² e il prodotto forza per area ha unità N·m²: nessuno dei due è una pressione.

Aiuto: Scomponi la forza rispetto alla faccia e individua la componente perpendicolare.

Famiglia: `una-forza-parallela-alla-faccia`; difficoltà 2; versione 2/base 1.

Rilettura d’autore dopo rilievi distinti B: il distrattore 54 kPa insieme all’area tripla produrrebbe una forza nove volte maggiore. Il quoziente nella figura ora mostra N e m² espliciti. Tutte le risposte e formule dei blocchi sono identiche; cambiano il feedback di Q007 e i riferimenti all’asset di Q002/Q007/Q008. Vecchia edizione e immagine realmente riuscita conservate, nuovo native reale letto; firma scientifica distinta ancora necessaria.
