# Authoring DRAFT — force-current-wire-230

Tutti gli 80 prompt originali A230–234 sono stati letti individualmente tramite allowlist id/prompt prima del primo candidato U6-05. Fonte Git immutabile5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, U6-05 SHA256383a0881e644ab8d95bde40b9b3b3a748eaf0baaeaab941e895077251fd087fe. Compiti e casi autonomi preservati: cariche opposte23103, elettrone parallelo23303 e linee magnetiche23403 non sono assorbiti nei rispettivi modelli numerici. Inverse e rapporti mantengono domini e coefficienti dimensionali.

Prima di candidature entrambi i revisori avevano congelato la primaria: B per A230–234 SHA51395bd462210eea741c8535d111ebf94686590467d5821825834e6e8668f91d su4fcc49cee05f35b838084471fe41bf5babc83f8f (mai aperta dall’autore); A per B235–239 SHAc0d2d26dd79ece4c7ad2ff06d8ddd142acf02eb468b971b3e254ed06e16528bc subc4da66c96cc57f8629b8252a24ce2f1943f7f5e. Nessuna chiave, soluzione, hint, opzione o candidata B235–239 letta durante l’autoria A.

Rilette integralmente le lezioni reali C4-L09 e C4-L10: forza di Lorentz su particella e filo, moto circolare, componente parallela e flusso orientato. Mappatura primaria L09 per230–233 e L10 per il flusso234, con eventuale override autonomo23403 a L09; prerequisiti selezionati sul catalogo reale, senza confondere C1-L006 elasticità/gravitazione con il moto curvo di C1-L004. Nessuna competenza inventata.

Autore soltanto: DRAFT, revisione scientifica distinta NOT_RUN_BY_AUTHOR, human NOT_RUN, publicationAction NONE. Nessun proprio verificatore o firma scientifica. Due processi separati dell’assembler unico hanno prodotto package/binding byte-identici. Importatore canonico ROOT in sola lettura su SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e storico conservati. Queste sono prove strutturali e di preservazione, senza accredito di integrazione o approvazione scientifica.

Figura SVG-only realmente renderizzata in browser nativo a piena altezza sotto mutex condiviso e guardia≥2 GiB; XML e PNG completo effettivamente letti. Il processo è terminato exit0, non si è dedotta la riuscita dalla sola comparsa del PNG. Nessuna pagina del prodotto, nessun server o dato studenti usato. UI prodotto e responsività320px NOT_RUN, riservate al runner canonico dell’integratore. I testi visibili non mostrano metriche ingegneristiche e non confrontano scale di pannelli indipendenti.

## AR-u6-force-current-wire-01 — Da centimetri a millinewton

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Con I=2 A e L=3 cm, quanto vale F in mN?

Procedimento d’autore: La forza sul filo è I volte il prodotto vettoriale della lunghezza orientata con B. Il modulo, con angolo retto, è BIL. Tre centimetri sono 3/100 m: F=1·2·3/100 N=6/100 N. Un newton vale mille millinewton, quindi il risultato è 60 mN. Non si interpreta la corrente come carica di una sola particella.

Formule: F=BIL;  L=\frac3{100}\,\mathrm m;  F=\frac6{100}\,\mathrm N;  F=60\,\mathrm{mN}.

Distrattori e controprove: Sei mN perde un fattore dieci nella conversione cm→mN; 6000 mN tratterebbe 3 cm come 3 m. Centoventi mN aggiunge un fattore due alla legge. Il verso dipende invece da corrente e campo come vettori.

Hint: Converti L in metri prima di riportare la forza in mN.

Fonte canonica SHA256 4253b7f175d6108b6aacfa94b5294a28fc81a40716a634f69fe120accfd12302. Candidato SHA256 57c2e821292070eddf396398b28d086dbbd1927ca966e00daf94ba6d099f9a49. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-02 — L’unità rimane quella di una forza

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Quale unità misura F?

Procedimento d’autore: La forza magnetica ha la stessa dimensione di una forza meccanica: si misura in newton o in un suo prefisso. Il tesla ha unità N/(A·m), perciò BIL restituisce newton. La presenza di una corrente non trasforma la forza in ampere.

Formule: [B]=\mathrm{N/(A\,m)};  [F]=\mathrm N.

Distrattori e controprove: A misura corrente e T campo magnetico. J è energia; il lavoro di una forza dipende anche dallo spostamento, mentre qui si chiede F. C è carica. Solo mN è una forza fra le alternative.

Hint: Cancella A e m nel prodotto delle unità BIL.

Fonte canonica SHA256 5119f9180a18fe6e500a609822d5c3414519c20158a770deff02f5c509a3d999. Candidato SHA256 4f4cecb9a1d5714f1b67541f28f11d190f43ec8911b3077a16dad06d8b488fea. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-03 — La conversione dentro la relazione numerica

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Definiamo i=I/(1 A), λ=L/(1 cm) e f=F/(1 mN), tre numeri puri. Quale legge li collega?

Procedimento d’autore: Un centimetro è un centesimo di metro: il prodotto BIL vale iλ/100 newton. Passare a mN moltiplica il numero per mille, così f=10iλ. Il fattore dieci nasce dalle unità dichiarate e da B=1 T; la legge dimensionale resta F=BIL.

Formule: F=\frac{i\lambda}{100}\,\mathrm N;  f=10i\lambda.

Distrattori e controprove: iλ omette la conversione residua. Dividere per λ o per i renderebbe inversa una dipendenza diretta. Il quadrato di i non appartiene alla forza magnetica sul filo: non è la legge della potenza dissipata I²R.

Hint: Separa la legge fisica dalla relazione fra i valori numerici.

Fonte canonica SHA256 d8619007e1e2ccd94699650497a50bf4386774e51b33aa0b1ceb7b1553c7f2c0. Candidato SHA256 267477a47e5eaa195f37e9aba888c106f8fa8541b0efe079b7adab4464a84006. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-04 — Corrente dimezzata sullo stesso tratto

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. L resta 3 cm e I passa da 2 A a 1 A fra due prove. Come cambia F?

Procedimento d’autore: A lunghezza, campo e angolo fissati, F è lineare in I. La seconda corrente è metà della prima e il modulo passa da 60 a 30 mN. Non è necessario supporre come il generatore abbia cambiato la corrente: si confrontano i due stati mantenuti.

Formule: F_A=60\,\mathrm{mN};  F_B=30\,\mathrm{mN};  F_B/F_A=\frac12.

Distrattori e controprove: Centoventi inverte l’effetto. Quindici usa il quadrato del fattore 1/2; sessanta ignora la nuova corrente. Zero richiederebbe corrente nulla o filo parallelo al campo, condizioni escluse.

Hint: Nella forza compare I, non I².

Fonte canonica SHA256 0f5f7d0c76efa9ca5818f1c656d63922cd06990d7819b765b05d8fe042d46e3c. Candidato SHA256 95a2a6702cd4008b7b5a0cebd82ce3c40098c0f52894a1f9913190df27b67c1f. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-05 — La corrente da una misura di forza

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. F=60 mN e L=3 cm. Quanto vale I in A?

Procedimento d’autore: Isolo I=F/(BL). La forza misurata è 60/1000 N e la lunghezza 3/100 m: il quoziente è (60/1000)/(3/100) A=2 A. B e L sono positivi: non c’è un denominatore nullo.

Formule: I=\frac F{BL};  I=\frac{60/1000}{3/100}\,\mathrm A;  I=2\,\mathrm A.

Distrattori e controprove: Venti A dividerebbe 60 per 3 senza il fattore dieci della relazione in mN e cm. Mezzo A darebbe solo 15 mN; sessanta A copia il valore numerico di F senza l’inversa fisica.

Hint: Verifica il risultato riportandolo in BIL.

Fonte canonica SHA256 84d5f1239ade31ba50561f67abfb2f826afb9db99939215bbbeba70e727a745d. Candidato SHA256 a576c67664a3fd26b9682207dd140fc7ae467e20103bbe914de84fd88bc9fc00. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-06 — La parte di filo davvero immersa

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. F=60 mN con I=2 A. Quanto vale L in cm?

Procedimento d’autore: La legge richiede la lunghezza del tratto immerso e perpendicolare. Isolo L=F/(BI): il risultato è 3/100 m, cioè 3 cm. Non si prende la lunghezza di un eventuale circuito esterno alla regione di campo.

Formule: L=\frac F{BI};  L=\frac3{100}\,\mathrm m;  L=3\,\mathrm{cm}.

Distrattori e controprove: Trenta cm omette il fattore dieci fra le unità numeriche. Un terzo cm è il reciproco numerico di tre e darebbe 20/3 mN. Due cm copia la corrente e darebbe 40 mN.

Hint: Calcola prima la lunghezza in metri, poi moltiplica per cento.

Fonte canonica SHA256 7cc9f1526b237cd217bafb6d9f141fe0d21068948ee59fdacd2388e6d676b4fe. Candidato SHA256 ee32c90ea7fc57c8b2d328e577af8764a0feef97690e9463561b2ab62a6d8e5e. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-07 — Un tratto tre volte più corto

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. A usa I=2 A e L=3 cm. B usa la stessa corrente con L=1 cm. Quanto vale F_B/F_A?

Procedimento d’autore: A dà 60 mN e B dà 20 mN. Il rapporto B/A è 20/60=1/3, identico al rapporto delle lunghezze perché corrente, campo e angolo sono gli stessi. Il risultato è un numero puro.

Formule: F_A=60\,\mathrm{mN};  F_B=20\,\mathrm{mN};  F_B/F_A=\frac13.

Distrattori e controprove: Tre inverte il confronto. Un nono e nove introducono un quadrato non presente; uno ignora il diverso tratto immerso. Il verso della forza può restare uguale mentre cambia il modulo.

Hint: Confronta le lunghezze immerse, non l’intero circuito.

Fonte canonica SHA256 d7b12309a7827b306532ead590cc5aec8fa930c7dcd7ad6e5063de9e862d059c. Candidato SHA256 d1de0a2a9f9c1e5107a0d4878bb332a3956fc4ce6415ed19afaf85ae6ba7b473. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-08 — Proposta e forza calcolata

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Con I=2 A e L=3 cm viene proposta F_proposta=120 mN. Quanto vale proposta meno corretto?

Procedimento d’autore: La legge dà 60 mN. Lo scarto con l’ordine richiesto è 120−60=+60 mN. Due sarebbe il rapporto della proposta al corretto e avrebbe un altro significato.

Formule: F=60\,\mathrm{mN};  e=(120-60)\,\mathrm{mN};  e=60\,\mathrm{mN}.

Distrattori e controprove: −60 scambia l’ordine; 120 copia la proposta; zero la accetta senza verifica. Il numero puro due non è una differenza di forze.

Hint: Conserva mN nella sottrazione.

Fonte canonica SHA256 523ae3f712515b7a0271e650e597b30d1f8ca5c92a40420900a0cd7b2415848d. Candidato SHA256 d0b8184d7c9bc1fbff533a6fc810f562993e0d7cb346f2d317f8a25625126656. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-09 — L’inversa con le grandezze fisiche

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. F e L sono noti. Quale relazione isola I usando unità coerenti per tutte le grandezze?

Procedimento d’autore: F=BIL contiene I moltiplicata per BL. Divido entrambi i membri per il prodotto positivo BL: I=F/(BL), con unità ampere. Se si usano i numeri in mN e cm, si deve prima convertire oppure dividere il numero F per dieci volte il numero L.

Formule: I=\frac F{BL};  [I]=\mathrm A.

Distrattori e controprove: FL/B ha unità A·m², BL/F ha A⁻¹ e F/B ha A·m. Il quadrato di L aggiunge un fattore inverso di lunghezza. Queste espressioni non isolano una corrente.

Hint: Mantieni B e L nel denominatore dell’inversa.

Fonte canonica SHA256 7409bae95f41eea949d4ec869432aa1e6d5422ab2b191b80644e7643137eefc4. Candidato SHA256 aa89ea6031172935f33229a0eef62040e6027967aee8948f89b897b637cc88f7. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-10 — Due fattori sullo stesso prodotto

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Fra prove B usa I_B=κ₁I_A e L_B=κ₂L_A, con fattori positivi. Campo e angolo restano uguali. Quanto vale F_B/F_A?

Procedimento d’autore: Inserisco nella legge entrambi i nuovi dati: F_B=B(κ₁I_A)(κ₂L_A). Dividendo per F_A=B I_A L_A si cancellano i dati positivi comuni e resta κ₁κ₂. I due fattori descrivono preparazioni, non un allungamento dinamico obbligato del medesimo filo.

Formule: F_B=B(\kappa_1I_A)(\kappa_2L_A);  F_B/F_A=\kappa_1\kappa_2.

Distrattori e controprove: I quozienti invertono una dipendenza diretta. Il quadrato di κ₁ introduce una legge diversa; la somma darebbe due anche per due prove identiche, con entrambi i fattori unitari.

Hint: Controlla il limite κ₁=κ₂=1.

Fonte canonica SHA256 8771845050bc5fd8059b9c3657a1167b66052aadcdc17b1769e15d27f5a79a67. Candidato SHA256 6dbc8c4dddbf6d03fe334072958716de88858cd551d449cb829a2ac55da81187. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-11 — La corrente cala ma il tratto aumenta

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. A ha I=2 A e L=3 cm. B ha I=1 A e L=4 cm. Quanto vale F_B/F_A?

Procedimento d’autore: A produce 60 mN; B produce 10·1·4=40 mN. Il rapporto è 40/60=2/3. La lunghezza maggiore compensa solo in parte il dimezzamento della corrente.

Formule: F_A=60\,\mathrm{mN};  F_B=40\,\mathrm{mN};  F_B/F_A=\frac23.

Distrattori e controprove: 3/2 è il reciproco. Mezzo considera solo I, 4/3 solo L, mentre uno suppone una compensazione esatta che i prodotti non confermano.

Hint: Calcola entrambe le forze prima del rapporto.

Fonte canonica SHA256 b766c2bcb164a7976b0210c16e0f08742d60ca4f3171ff3c78fa9fd5818dad8c. Candidato SHA256 bf30e200261edb7660de61ab616cab61f9e509e94cb69c9a0808c84da369ab6c. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-12 — Media delle due forze mantenute

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Si mediano con uguale peso le letture di A: I=2 A,L=3 cm e B: I=1 A,L=4 cm. Qual è la media di F?

Procedimento d’autore: La media delle uscite è (60+40)/2=50 mN. Ai dati medi I=3/2 A e L=7/2 cm la legge darebbe 10·(3/2)·(7/2)=105/2 mN. La differenza è −5/2 mN: un prodotto di ingressi variabili non commuta in generale con la media.

Formule: \overline F=50\,\mathrm{mN};  F_{\rm dati\ medi}=\frac{105}{2}\,\mathrm{mN};  50-\frac{105}{2}=-\frac52.

Distrattori e controprove: 105/2 usa gli ingressi medi; cento somma senza dimezzare; dieci è la semidifferenza. Zero non è una media di questi moduli positivi e non si chiede una somma vettoriale.

Hint: La statistica richiesta riguarda due uscite già calcolate.

Fonte canonica SHA256 39a79f224e359b127baad903964be3be573774f961527b603783e8af6fd03524. Candidato SHA256 eff384f7ded623add7c45da947804da0652e3de53ef4baf373dc6eb097fb4166. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-13 — La lunghezza per un bersaglio di forza

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. A ha I_A=2 A,L_A=3 cm. B usa I_B=1 A e deve dare F_B=(2/3)F_A. Quanto vale L_B/L_A?

Procedimento d’autore: Il bersaglio è 40 mN. Con una corrente da 1 A servono 4 cm di filo immerso, perché la relazione numerica è 40=10·1·L_B[cm]. Il rapporto cercato è dunque 4/3, distinto dal rapporto delle forze.

Formule: F_B=40\,\mathrm{mN};  L_B=4\,\mathrm{cm};  L_B/L_A=\frac43.

Distrattori e controprove: 3/4 inverte il confronto. Due terzi copia il bersaglio della forza e mezzo segue solo la corrente. Due darebbe L_B=6 cm e F_B=60 mN, non quaranta.

Hint: Traduci prima il bersaglio in mN, poi usa l’inversa.

Fonte canonica SHA256 da525165b5ad7b9875cc261423b8cc7743f4b5eb0c904a874a3a4408df3f0438. Candidato SHA256 1447b46cf181b453bf6e300a5cfd21a4a99e3cac6932821aaa21b1d2d204e527. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-14 — Dal display alla corrente

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Un display continuo adimensionale legge D=a_cal F, con a_cal>0 e senza offset. A: I=2 A,L=3 cm,D=180. B: L=4 cm,D=120. Quanto vale I_B in A?

Procedimento d’autore: A ha F_A=60 mN, quindi il guadagno vale 3 per mN. D_B=120 indica F_B=40 mN. Con L_B=4 cm, l’inversa numerica dà I_B=40/(10·4)=1 A. Il display non misura direttamente la corrente.

Formule: a_{\rm cal}=3\,(\mathrm{mN})^{-1};  F_B=40\,\mathrm{mN};  I_B=1\,\mathrm A.

Distrattori e controprove: Tre A tratterebbe D=120 come 120 mN. Quaranta A copia il numero della forza decodificata; 1/4 A darebbe 10 mN e D=30, non 120.

Hint: Decodifica F prima di dividere per BL.

Fonte canonica SHA256 17764c9b1d9a4ea8622789f186ee2e4f3e664e779590f352e53bdf4d7edce30e. Candidato SHA256 3d68350aee3fac096c95b423cb087924bdd1242627ece56e93a9d8e6bb84c7af. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-15 — Offset strumentale e corrente mantenuta

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Il display continuo adimensionale segue D=a_cal F+b_cal. A: I=2 A,L=3 cm,D=121. B: I=1 A,L=4 cm,D=81. C: L=5 cm,D=401. Quanto vale I_C in A?

Procedimento d’autore: Le forze dei riferimenti sono 60 e 40 mN. Il guadagno è (121−81)/(60−40)=2 per mN e l’offset è uno. La lettura 401 restituisce F_C=(401−1)/2=200 mN. La corrente vale 200/(10·5)=4 A.

Formule: a_{\rm cal}=2\,(\mathrm{mN})^{-1};  b_{\rm cal}=1;  F_C=200\,\mathrm{mN};  I_C=4\,\mathrm A.

Distrattori e controprove: 401/100 A omette l’offset e predirebbe D=402. Otto A sottrae b ma non divide per il guadagno. Duecento A copia il numero della forza senza dividere per il fattore fisico BL.

Hint: Sottrai l’offset prima della divisione per il guadagno.

Fonte canonica SHA256 ced7d88a0e67d512d3d06dcbdaa4f67b4fc20a289e654f99649173cbe5f9ffdc. Candidato SHA256 75e1fad1711cf52c5fc4c9f02a7a35a9dde55c581cdd324d4dea867b8328f224. Skill reale C4-L09. Review distinta e human NOT_RUN.

## AR-u6-force-current-wire-16 — Un vincolo fra prove seleziona la lunghezza

Un tratto rettilineo di filo, di lunghezza L finita e positiva, porta una corrente continua I>0 mantenuta dal circuito. Il tratto è interamente immerso in un campo esterno uniforme di modulo B=1 T ed è perpendicolare a B. Si cerca soltanto il modulo F della forza magnetica sul tratto, non la risultante con eventuali altre forze. Per i dati numerici L si esprime in cm e F in mN. Fra preparazioni si impone I=[(2/3) A/cm]L. Si misura F=60 mN. Quanto vale L?

Procedimento d’autore: Pongo λ=L/(1 cm)>0. Il vincolo dà I/(1 A)=(2/3)λ e la forza numerica diventa (20/3)λ². Sessanta mN impone λ²=60·3/20=9: il ramo positivo è λ=3. La lunghezza è 3 cm e la corrente 2 A; non è una legge di variazione temporale del filo.

Formule: \lambda=\frac{L}{1\,\mathrm{cm}};  \lambda^2=9;  L=3\,\mathrm{cm};  I=2\,\mathrm A.

Distrattori e controprove: −3 è la radice algebrica esclusa dalla lunghezza positiva; nove copia il quadrato. Due cm darebbe I=4/3 A e F=80/3 mN. La misura non è ridondante: fissa la scala.

Hint: Scegli il ramo positivo solo dopo aver risolto il quadrato.

Fonte canonica SHA256 ad4e17ae8a0e9a0c8ef1320c7da852c691b2861488311ff652b8b55f8c8099d8. Candidato SHA256 5035d3b6eb456199964b906c3f776686df0160a40c462bedd048b826b158608a. Skill reale C4-L09. Review distinta e human NOT_RUN.

## Lettura geometrica d’autore

Primo pannello: filo orizzontale, corrente convenzionale verso destra, campo entrante e forza verso l’alto. Le frecce hanno unità diverse e sono schematiche, senza scala comune dichiarata. Nel secondo pannello le barre300/200/250 coordinate da origine150 rappresentano60/40/50 mN, con scala comune5 coordinate/mN. Nel grafico, per L3 cm e B1 T, x=150+140I[A], y=1300−3F[mN]: punto(430,1120)=(2 A,60 mN). Origine aperta perché I>0, segmento mostrato soltanto fino a2 A, zero128 a sinistra e punte tutte libere. Scala del grafico distinta dalle barre. Queste coordinate intrinseche restano nella nota tecnica, non nel percorso studente.

## Provenienza tecnica

Asset SHA256 1a9af512b7c17b3e1426b25b627742424349ac97117306a82c1d4b6dd95628e2. Package file SHA256 3fe0c0448d5b0c5cf949c9d298a74bffb12ae69597a9293572508e5f516bce99. Binding file SHA256 f52c21da7ec7a847f32bdac65abcb2cdf1ef6862a6b7fda71c6749e9409fe7a3. Prova strutturale SHA256 b9a34c18a7f92058bb50285eb6ec9f9b0716f31d71521e2f9d3c08d035e126f7. Manifest asset-only SHA256 2139a8347644223baad01148c965fa7010778fffd799c27ad98dd15ed689aed5.

Nessun registry, ledger, runtime, checkpoint o Git ROOT modificato. Il revisore B è distinto e deve leggere i finali contro la propria primaria prima di qualsiasi firma. Prodotto UI NOT_RUN, nessun marker inventato o riusato.
