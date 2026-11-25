# Revisione indipendente AI delle lezioni di elettrostatica — lotto018

ROOT ha letto tutti i **27 blocchi** delle quattro lezioni storiche C4-L01..L04 e i quattro SVG completi, prima in XML e poi renderizzati in Chromium a640px. Nessun testo, figura o metadato storico è stato riscritto. Il revisore non ha scritto le edizioni lette: fonte Git5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA25619d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. L'ownership018 è separata dalla review C3 del terzo agente.

**Quattro originali accettati, zero difetti concreti rilevati; 34 controlli matematici con dominio e unità, cinque test PASS**, inclusi40 esempi deterministici Hypothesis. I calcoli numerici del verificatore sono esempi costruiti dal revisore: le lezioni non assegnano dati numerici che richiedano divisioni lunghe, trigonometria o radici decimali. Nessuna risposta originaria o modulo di authoring è usato come oracolo. Fonte, hash delle figure e giudizio concettuale si aggiungono ai controlli esatti, non sono dedotti da un'identità algebrica.

## C4-L01

Verificati trasferimento di elettroni e conservazione della carica nel sistema isolato, carattere algebrico di q, assenza di trasformazioni nucleari nella normale elettrizzazione, attrazione/repulsione ed entrambe le forze su corpi distinti. Per due cariche ferme puntiformi nel vuoto, il potenziale di coppia kq1q2/r dà forza radiale kq1q2/r² per derivazione; invertire la carica cambia il verso, dimezzare la distanza quadruplica il modulo. Nel diagramma le frecce hanno uguale lunghezza106px e versi opposti; la quota r è fra i centri, non fra le superfici. Non si sommano le due forze sul diagramma di un solo corpo.

Le costanti stampate hanno già il simbolo di approssimazione. Il valore SI esatto della carica elementare è1.602176634·10^-19C secondo [NIST SP330 §2](https://www.nist.gov/pml/special-publication-330/sp-330-section-2); il verificatore quantifica la differenza da1.602·10^-19 anziché annullarla. Non si richiede al lettore di calcolare la costante esatta né di trattare come misura esatta il valore arrotondato. Nel solo probe con coefficiente di lavoro dichiarato9·10^9, due cariche2µC/3µC a30cm danno3/5N: si cancellano9 e potenze di dieci prima delle divisioni.

## C4-L02

Dalla definizione con prova positiva sufficientemente piccola si distingue il campo sorgente dalla forza sulla carica introdotta. Il gradiente del potenziale ricostruisce la direzione del campo; due sorgenti uguali si cancellano al punto medio, due opposte vi rinforzano i contributi. La figura mostraE verso la piastra negativa eF opposta per una carica negativa. Nessun vettore necessario manca di punta.

Il moto a accelerazioneqE/m costante vale per campo uniforme, massa e carica costanti, altre forze trascurate e regime non relativistico. Con componente trasversale iniziale non nulla si elimina t per ricavare la parabola; se tale componente è nulla la traiettoria è rettilinea, limite esplicitamente conservato. Le linee non si incrociano in un punto di campo non nullo. Il probe−2µC in4N/C dà−8µN; dividere per2mg cancella10^-6 e dà−4m/s².

## C4-L03

Il testo fissaΔV=VB−VA prima diΔU=qΔV. Wcampo=−ΔU e, con sola forza elettrica,ΔK=−qΔV hanno segni coerenti. Cambiare lo zero aggiunge la stessa costante e non alteraΔV. Ricostruita l'energia di tre cariche da metà della somma di qiVi, conVi dovuto alle altre due: ogni coppia compare una sola volta. Differenziare kq/r dà il campo puntiforme, la cui direzione dipende dal segno di q.

La formula−E·Δr è limitata al campo uniforme; un percorso lungo l'equipotenziale perpendicolare aE dàΔV=0 dalla stessa funzione potenziale, non da una pretesa generale che ogni spostamento faccia lavoro. Il grafico ha coordinate147,261,375,489px equidistanti e valori60,40,20,0V: gradiente uniforme negativo, campo orizzontale positivo. I pixel non diventano metri e nessun valore fisico diE è inventato. Per3µC che scendono di20V,ΔU=−60µJ eΔK=+60µJ. Per carica negativa i segni si invertono.

## C4-L04

Induzione e polarizzazione sono distinte mediante mobilità degli elettroni e coppie legate. Contate tre cariche− e tre+ nel conduttore e sei dipoli nel dielettrico: ciascun campione resta neutro. Campo esterno a destra, separazione delle cariche coerente edEint=0 nel materiale del conduttore in equilibrio. Non si estende la conclusione al vuoto di qualunque cavità o al metallo resistivo percorso da corrente.

Il collegamento a terra può cambiare la carica del campione; l'isolamento impedisce quel trasferimento. La riduzione del campo perεr>1 riguarda il modello usuale di piastre ideali e dielettrico lineare che riempie il gap a carica libera fissata. A tensione e gap fissi è inveceE=V/d che rimane fissato: il verificatore conserva il controesempio, non estende la conclusione all'altro vincolo. I probe12/4=3N/C e6V/(2cm)=300V/m hanno procedimenti manuali espliciti. Il controesempio di filo resistivo dàE=RI/l=3V/m, che non è equilibrio elettrostatico.

## Integrità e limiti

I test cambiano il testo di ciascuna lezione, omettono ogni ID e rimuovono/modificano ciascuna figura: tutte le prove si invalidano. Un elenco matematico vuoto o un controllo fallito non produce PASS per verità vacua. Le controprove geometrico-fisiche leggono direzioni, distanze, valori e neutralità dall'XML originale. I controlli concettuali restano letture AI esplicite; questa review non certifica apprendimento reale o conformità universale di accessibilità.

Nessuna promozione, bozza aggiunta, firma umana o tentativo studente. `humanApproval=NOT_RUN`, `publicationAction=NONE`. Registro e checkpoint non sono stati aggiornati da questa review; sarà l'integratore a contarla dopo l'aggregazione dei report.

VerificatoreSHA256 `c3540bf90360529d6e9dc59c1b67499b62ef7970dcc4ecf05fda8a128afbb898`; testSHA256 `9cc716e85bddf6dc33c250e6cd1af36bf8cabe1d05cdca68fb043527a319b1ee`; reportSHA256 `f918a75fc2d9d91d1fce19ef46272a387b59e0ac803465e71d7efaf23cead2b8`.
