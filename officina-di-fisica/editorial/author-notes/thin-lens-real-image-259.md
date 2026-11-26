# thin-lens-real-image-259 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json`, SHA `43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7`. Tutti gli 80 prompt B255–259 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B255–259 commit d0628ef6, SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4, ricevuta solo come hash/percorso e mai aperta; B per A250–254 commit 7518f76e, SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L08 nuclei e transizioni, L09 rifrazione e angolo limite (prereq L06), L10 lenti (prereq L09), tutti letti integralmente.

Riferimenti primari consultati per le leggi: [OpenStax, trasformazioni nucleari](https://openstax.org/books/university-physics-volume-3/pages/10-key-equations), [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello didattico, non una prescrizione clinica o una garanzia di realizzabilità di catene nucleari.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello1 scala75 coordinate/cm orizzontale e450verticale, amplificazione6× delle sole altezze dichiarata nel testo visibile: lente(360,320), oggetto(60,248), foci285/435, immagine(460,344), p4cm,q4/3cm,h0.16cm,hprime−0.16/3cm. Raggio parallelo viaFprime e centrale si incrociano esattamente460,344. Barre scala90coordinate/cm:120/270/195 per4/3,3,13/6. Grafico origine150,1570 scale65coordinate/cm orizzontale e90verticale (indipendenti dichiarate come assi non raydiagram), q=p/(p−1) su1.5≤p≤6; asintoti p1,q1 esclusi.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-thin-lens-real-image-01 — Dove si può collocare lo schermo?

Ipotesi e percorso manuale d’autore: Uso la legge dei punti coniugati: il reciproco di q è 1/f−1/p. Qui vale 1−1/4=3/4 cm⁻¹; invertendolo trovo q=4/3 cm. Il risultato positivo colloca l’immagine reale oltre la lente, fra f e 2 f, coerentemente con un oggetto oltre 2 f.

Passaggi: \frac1q=\frac1f-\frac1p;  \frac1q=\frac34\,\mathrm{cm^{-1}};  q=\frac43\,\mathrm{cm}

Risposta proposta: 4/3.

Distrattori: Tre quarti è il numero che esprime 1/q in cm⁻¹, non q in cm. Quattro ripete la distanza dell’oggetto, cinque somma p e f; il valore negativo descriverebbe un’immagine virtuale fuori da p>f.

## AR-u7-thin-lens-real-image-02 — La distanza ha dimensione di lunghezza

Ipotesi e percorso manuale d’autore: q è una lunghezza. Nella legge dei punti coniugati compaiono i reciproci delle lunghezze, ma l’uscita richiesta rimane q. Si può usare qualunque unità di lunghezza coerente, come centimetri o metri.

Passaggi: [q]=L;  [1/q]=L^{-1}

Risposta proposta: cm.

Distrattori: cm⁻¹ misura 1/q, il numero puro può descrivere l’ingrandimento, i gradi un angolo e i secondi un tempo. La forma reciproca della legge non cambia la dimensione della distanza.

## AR-u7-thin-lens-real-image-03 — Oggetto dentro il fuoco: caso autonomo

Ipotesi e percorso manuale d’autore: Qui il denominatore p−f è negativo, quindi q<0: i raggi emergenti divergono e soltanto i loro prolungamenti si incontrano sul lato dell’oggetto. L’ingrandimento m=−q/p=f/(f−p) èpositivo e maggiore di uno. L’immagine è dunque diritta e ingrandita, ma non si raccoglie su uno schermo sul lato d’uscita.

Passaggi: q=\frac{fp}{p-f}<0;  m=-\frac qp;  m=\frac f{f-p}>1

Risposta proposta: Virtuale, diritta e ingrandita, sul lato dell’oggetto.

Distrattori: Reale richiederebbe raggi che si incontrano davvero sul lato d’uscita. Un ingrandimento negativo descriverebbe inversione, mentre qui m>0. L’ultima opzione confonde l’assenza di immagine reale con l’assenza di immagine nel modello.

## AR-u7-thin-lens-real-image-04 — Una focale diversa alla stessa distanza

Ipotesi e percorso manuale d’autore: Ricalcolo il denominatore, che cambia insieme alla focale: in B q=2·4/(4−2)=4 cm. L’immagine passa da 4/3 a 4 cm. In B oggetto e immagine sono a 2 f, non al fuoco; quindi non c’è alcuna divergenza della distanza.

Passaggi: q_A=\frac43\,\mathrm{cm};  q_B=\frac{2\cdot4}{4-2}\,\mathrm{cm};  q_B=4\,\mathrm{cm}

Risposta proposta: Da 4/3 a 4 cm.

Distrattori: 8/3 raddoppia soltanto il numeratore del vecchio risultato, lasciando erroneamente fisso p−f.2/3 dimezza l’uscita; l’infinito si avrebbe a p=f, che qui non accade.

## AR-u7-thin-lens-real-image-05 — Ricavare la focale dai coniugati

Ipotesi e percorso manuale d’autore: Sommo i reciproci delle due distanze:1/f=1/4+3/4=1 cm⁻¹, così f=1 cm. Equivalentemente f=pq/(p+q); la somma al denominatore garantisce che f sia minore di entrambe le distanze positive.

Passaggi: \frac1f=\left(\frac14+\frac34\right)\mathrm{cm^{-1}};  \frac1f=1\,\mathrm{cm^{-1}};  f=1\,\mathrm{cm}

Risposta proposta: 1 cm.

Distrattori: 16/3 cm sommerebbe direttamente p e q. Tre cm non riprodurrebbe i reciproci; quattro cm porrebbe l’oggetto al fuoco e non darebbe l’immagine reale finita osservata.

## AR-u7-thin-lens-real-image-06 — Ricavare la posizione dell’oggetto

Ipotesi e percorso manuale d’autore: Porto 1/q a destra:1/p=1/f−1/q=1−3/4=1/4 cm⁻¹, da cui p=4 cm. Per quest’inversa nel ramo reale serve q>f: il denominatore q−f è qui 1/3 cm, positivo.

Passaggi: \frac1p=\frac1f-\frac1q;  \frac1p=\frac14\,\mathrm{cm^{-1}};  p=4\,\mathrm{cm}

Risposta proposta: 4 cm.

Distrattori: Un quarto copia il reciproco in cm⁻¹;7/3 cm sommerebbe f e q, non i reciproci. Un p minore di f sarebbe incompatibile con il ramo reale dichiarato.

## AR-u7-thin-lens-real-image-07 — Allontanare l’oggetto

Ipotesi e percorso manuale d’autore: Le distanze d’immagine sono 4/3 cm e 6/5 cm. Dividendo la seconda per la prima ottengo(6/5)(3/4)=9/10: l’immagine si avvicina al fuoco quando l’oggetto si allontana. Non cresce in proporzione a p.

Passaggi: q_A=\frac43\,\mathrm{cm};  q_B=\frac65\,\mathrm{cm};  R=\frac{6/5}{4/3};  R=\frac9{10}

Risposta proposta: 9/10.

Distrattori: 10/9 inverte il rapporto;3/2 confronta soltanto p.6/5 è il valore numerico di q_B in centimetri, non il rapporto; uno trascura il cambiamento di oggetto.

## AR-u7-thin-lens-real-image-08 — Scarto fra due posizioni proposte

Ipotesi e percorso manuale d’autore: Il corretto è 4/3 cm. La proposta 8/3 cm lo supera di 4/3 cm: la differenza ordinata è positiva. Due sarebbe il rapporto della proposta al corretto e non una distanza.

Passaggi: q=\frac43\,\mathrm{cm};  \delta q=\left(\frac83-\frac43\right)\mathrm{cm};  \delta q=\frac43\,\mathrm{cm}

Risposta proposta: 4/3.

Distrattori: −4/3 sottrae nel verso opposto;8/3 ripete la proposta. Due copia il valore del rapporto:2 cm non è lo scarto corretto; zero accetta una posizione che non soddisfa la legge.

## AR-u7-thin-lens-real-image-09 — L’inversa simbolica per f

Ipotesi e percorso manuale d’autore: La somma 1/p+1/q si porta al denominatore comune pq:1/f=(p+q)/(pq). Invertendo ottengo f=pq/(p+q). L’unità è lunghezza perché il prodotto L² è diviso per una lunghezza positiva.

Passaggi: \frac1f=\frac{p+q}{pq};  f=\frac{pq}{p+q};  [f]=L

Risposta proposta: f = p q / (p + q).

Distrattori: Il segno meno non deriva dalla somma dei reciproci. p+q somma direttamente distanze, il rapporto inverso ha dimensione L⁻¹ e pq ha dimensione L². La sola dimensione non scarta la prima alternativa sbagliata: serve anche l’algebra.

## AR-u7-thin-lens-real-image-10 — Focale e oggetto cambiano insieme

Ipotesi e percorso manuale d’autore: Inserisco entrambi i fattori nel prodotto e nella differenza. Dividendo per q_A=fp/(p−f), il prodotto fp si cancella, mentre restano i due denominatori distinti. La nuova differenzaκ₂p−κ₁f deve essere strettamente positiva; la formula non si estende al fuoco o al ramo virtuale senza cambiare il dominio.

Passaggi: q_B=\frac{\kappa_1\kappa_2fp}{\kappa_2p-\kappa_1f};  R=\frac{\kappa_1\kappa_2(p-f)}{\kappa_2p-\kappa_1f}

Risposta proposta: κ₁ κ₂ (p − f) / (κ₂ p − κ₁ f).

Distrattori: Il solo prodotto dei fattori dimentica il denominatore nuovo. Il quoziente dei fattori dà una legge inversa impropria; l’altro rapporto inverte il contributo dei denominatori e perde il prodotto. La somma non dà uno a fattori entrambi unitari.

## AR-u7-thin-lens-real-image-11 — Due coniugati nuovi

Ipotesi e percorso manuale d’autore: In A q=4/3 cm; in B q=12/(6−2)=3 cm. Il rapporto 3/(4/3)=9/4 tiene conto di entrambi i cambiamenti. Tre è la distanza numerica in centimetri di B, non il rapporto richiesto.

Passaggi: q_A=\frac43\,\mathrm{cm};  q_B=3\,\mathrm{cm};  R=\frac3{4/3};  R=\frac94

Risposta proposta: 9/4.

Distrattori: 4/9 inverte il confronto; due segue soltanto f e 3/2 soltanto p. Tre non è stato diviso per il valore A.

## AR-u7-thin-lens-real-image-12 — Media di due piani d’immagine

Ipotesi e percorso manuale d’autore: Le distanze sono 4/3 e 3 cm. La media vale(4/3+3)/2=13/6 cm. Con i dati medi f=3/2 cm,p=5 cm si avrebbe invece 15/7 cm, inferiore di 1/42 cm: la funzione razionale non commuta con questa media.

Passaggi: \overline q=\frac{4/3+3}{2}\,\mathrm{cm};  \overline q=\frac{13}{6}\,\mathrm{cm};  q_{\rm dati\ medi}=\frac{15}{7}\,\mathrm{cm}

Risposta proposta: 13/6.

Distrattori: 15/7 applica il modello ai parametri medi,13/3 somma senza dimezzare.4/3 e 3 ripetono una sola lettura. La media descrive due piani distinti, non impone che un unico schermo sia a entrambi.

## AR-u7-thin-lens-real-image-13 — Il nuovo oggetto dal target

Ipotesi e percorso manuale d’autore: Il bersaglio d’immagine vale 3 cm. Dall’inversa p=fq/(q−f) ricavo p_B=2·3/(3−2)=6 cm, maggiore di f_B. Dividendo per p_A=4 cm ottengo 3/2.

Passaggi: q_B=3\,\mathrm{cm};  p_B=\frac{2\cdot3}{3-2}\,\mathrm{cm};  p_B=6\,\mathrm{cm};  p_B/p_A=\frac32

Risposta proposta: 3/2.

Distrattori: Due terzi inverte il confronto;9/4 è il fattore delle uscite e due quello della focale. Uno lascerebbe p_B=4 cm e darebbe q_B=4 cm, diverso dal bersaglio.

## AR-u7-thin-lens-real-image-14 — Una misura ottica amplificata

Ipotesi e percorso manuale d’autore: Il riferimento ha q=4/3 cm, quindi il guadagno è 3 unità strumentali per centimetro. La lettura nove rappresenta q=3 cm. L’inversa f=pq/(p+q) fornisce 18/9=2 cm, coerente con un oggetto oltre il fuoco.

Passaggi: g=\frac4{4/3};  g=3;  q=3\,\mathrm{cm};  f=\frac{6\cdot3}{6+3}\,\mathrm{cm};  f=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: 18/5 cm userebbe nove come distanza:6·9/(6+9). Tre copierebbe q, sei copierebbe p; nessuna di queste ricostruisce il display e i coniugati insieme.

## AR-u7-thin-lens-real-image-15 — Lo zero del display

Ipotesi e percorso manuale d’autore: Le distanze di riferimento sono 4/3 e 3 cm. Il guadagno è(7−11/3)/(3−4/3)=2 e l’offset è 1. La prova nove indica q=4 cm. Con p=4 cm si ha f=16/8=2 cm: oggetto e immagine sono entrambi a 2 f.

Passaggi: g=\frac{7-11/3}{3-4/3};  g=2;  b=1;  q_C=4\,\mathrm{cm};  f_C=\frac{4\cdot4}{4+4}\,\mathrm{cm};  f_C=2\,\mathrm{cm}

Risposta proposta: 2 cm.

Distrattori: 36/17 cm ometterebbe l’offset e userebbe q=9/2 cm. Quattro si fermerebbe alla distanza d’immagine e uno ripeterebbe la focale del primo riferimento senza giustificazione.

## AR-u7-thin-lens-real-image-16 — Un vincolo seleziona una distanza

Ipotesi e percorso manuale d’autore: Sostituisco f=p/4 nella legge dei coniugati. Il numeratore è p²/4 e il denominatore 3 p/4: per p>0 il rapporto èp/3. La misura 4/3 cm impone p=4 cm e dunque f=1 cm. Non rimane una scala libera dopo la distanza assoluta osservata.

Passaggi: q=\frac{p^2/4}{3p/4};  q=\frac p3;  p=3q;  p=4\,\mathrm{cm};  f=1\,\mathrm{cm}

Risposta proposta: 4 cm.

Distrattori: Un centimetro copia la focale cercata solo in seguito;4/9 cm userebbe q/3 invece di 3 q e non ricostruirebbe la misura. Una famiglia infinita sarebbe possibile senza q assoluto, non con il dato assegnato.
