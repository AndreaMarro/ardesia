# gamma-transition-energy-256 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json`, SHA `43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7`. Tutti gli 80 prompt B255–259 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B255–259 commit d0628ef6, SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4, ricevuta solo come hash/percorso e mai aperta; B per A250–254 commit 7518f76e, SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L08 nuclei e transizioni, L09 rifrazione e angolo limite (prereq L06), L10 lenti (prereq L09), tutti letti integralmente.

Riferimenti primari consultati per le leggi: [OpenStax, trasformazioni nucleari](https://openstax.org/books/university-physics-volume-3/pages/10-key-equations), [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello didattico, non una prescrizione clinica o una garanzia di realizzabilità di catene nucleari.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello1 origine energia y490, scala3 coordinate/keV: livelli20→430 e100→190, freccia del salto240=80keV. Pannello3 origine150 e scala4 coordinate/keV: barre320/4/162 per80/1/40.5keV. Schemi A/Z senza scala spaziale.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-gamma-transition-energy-01 — Il fotone porta la differenza

Ipotesi e percorso manuale d’autore: Il nucleo perde energia scendendo dal livello iniziale a quello finale. Senza rinculo tutta la perdita assegnata va nel fotone: cento meno venti vale ottanta keV. La somma dei livelli non misura la perdita e lo zero comune si cancella nella differenza.

Passaggi: E_\gamma=E_i-E_f;  E_\gamma=(100-20)\,\mathrm{keV};  E_\gamma=80\,\mathrm{keV}

Risposta proposta: 80 keV.

Distrattori: Centoventi somma i livelli; meno ottanta cambia il verso dell’emissione e darebbe energia del fotone negativa. Cento omette l’energia che il nucleo conserva e centosessanta raddoppia il salto senza motivo.

## AR-u7-gamma-transition-energy-02 — Energia non significa frequenza

Ipotesi e percorso manuale d’autore: L’elettronvolt è un’unità di energia, e il prefisso kilo moltiplica il valore dell’unità per mille. La frequenza è una grandezza distinta legata all’energia dalla costante di Planck, E_γ=hf; non si possono sostituire keV e Hz senza quel fattore dimensionato.

Passaggi: 1\,\mathrm{keV}=10^3\,\mathrm{eV};  E_\gamma=hf;  [E_\gamma]=ML^2T^{-2}

Risposta proposta: keV.

Distrattori: Hz misura frequenza, Bq attività, s tempo e m⁻¹ un inverso di lunghezza. Il tipo di radiazione non cambia la dimensione fisica dell’energia.

## AR-u7-gamma-transition-energy-03 — Dopo una semplice emissione gamma

Ipotesi e percorso manuale d’autore: Il fotone non porta via nucleoni né carica elettrica. Cambia lo stato energetico del nucleo, mentre i conteggi di protoni e neutroni restano quelli iniziali. La massa del sistema nucleare cambia per la perdita di energia, ma questo non cambia il numero di massa A, che è un conteggio.

Passaggi: \Delta A=0;  \Delta Z=0;  E_i-E_f>0

Risposta proposta: A e Z restano invariati; diminuisce l’energia di eccitazione.

Distrattori: I decrementi quattro e due descrivono un α. Gli incrementi o decrementi unitari di Z appartengono ai processi β; l’espulsione di nucleoni non è la semplice emissione γ dichiarata.

## AR-u7-gamma-transition-energy-04 — Alzare soltanto il livello iniziale

Ipotesi e percorso manuale d’autore: Il livello finale resta venti. Aumentare quello iniziale di venti aumenta dello stesso valore la differenza: il fotone passa da ottanta a cento keV. Non è una proporzione diretta con E_i quando il termine E_f resta non nullo.

Passaggi: E_{\gamma,A}=(100-20)\,\mathrm{keV};  E_{\gamma,A}=80\,\mathrm{keV};  E_{\gamma,B}=(120-20)\,\mathrm{keV};  E_{\gamma,B}=100\,\mathrm{keV}

Risposta proposta: Da 80 a 100 keV.

Distrattori: Novantasei applica il rapporto 120/100 alla vecchia uscita, dimenticando il livello finale fisso. Centoventi omette la sottrazione, centoquaranta somma e ottanta ignora il cambiamento.

## AR-u7-gamma-transition-energy-05 — Il livello iniziale dal salto

Ipotesi e percorso manuale d’autore: Il nucleo iniziale deve contenere sia l’energia lasciata al livello finale sia quella ceduta al fotone. Riordino il bilancio come E_i=E_f+E_γ e ottengo cento keV, maggiore del livello finale.

Passaggi: E_i=E_\gamma+E_f;  E_i=(80+20)\,\mathrm{keV};  E_i=100\,\mathrm{keV}

Risposta proposta: 100 keV.

Distrattori: Sessanta sottrarrebbe ancora il livello finale e darebbe un salto di quaranta. Ottanta confonderebbe il salto con il livello iniziale; centosessanta darebbe un salto di centoquaranta.

## AR-u7-gamma-transition-energy-06 — Il livello che rimane

Ipotesi e percorso manuale d’autore: Tolgo dall’energia nucleare iniziale quella portata dal fotone. Restano venti keV: il risultato è positivo e inferiore a cento come richiesto dal dominio. Il controllo inverso cento meno venti recupera ottanta.

Passaggi: E_f=E_i-E_\gamma;  E_f=(100-80)\,\mathrm{keV};  E_f=20\,\mathrm{keV}

Risposta proposta: 20 keV.

Distrattori: Centottanta sommerebbe l’energia emessa allo stato residuo. Meno venti inverte la differenza e ottanta copia l’energia del fotone invece del livello finale.

## AR-u7-gamma-transition-energy-07 — Un livello finale più alto

Ipotesi e percorso manuale d’autore: I salti sono ottanta e sessanta keV. Se il nucleo conserva più energia nel livello finale, ne cede meno al fotone: il rapporto B/A vale sessanta ottantesimi, cioè tre quarti. Il raddoppio di E_f non implica un semplice dimezzamento di E_γ.

Passaggi: E_{\gamma,A}=80\,\mathrm{keV};  E_{\gamma,B}=60\,\mathrm{keV};  R=\frac{60}{80};  R=\frac34

Risposta proposta: 3/4.

Distrattori: 4/3 inverte il rapporto. Due segue il solo livello finale, un mezzo gli attribuisce una falsa proporzione inversa e uno ignora il nuovo salto.

## AR-u7-gamma-transition-energy-08 — Sovrastima dell’energia emessa

Ipotesi e percorso manuale d’autore: La conservazione dà ottanta keV al fotone. La proposta centosessanta supera quel valore di ottanta keV: lo scarto con l’ordine richiesto è positivo. In questo modello non si dispone di centosessanta keV da cedere fra i due livelli assegnati.

Passaggi: E_\gamma=80\,\mathrm{keV};  \delta E=(160-80)\,\mathrm{keV};  \delta E=80\,\mathrm{keV}

Risposta proposta: 80.

Distrattori: Meno ottanta sottrae nel verso opposto, centosessanta ripete la proposta e due è il rapporto, che non ha unità di energia. Zero accetterebbe una violazione del bilancio.

## AR-u7-gamma-transition-energy-09 — L’inversa simbolica del bilancio

Ipotesi e percorso manuale d’autore: Aggiungo E_f a entrambi i membri della relazione del salto. La somma E_γ+E_f ha la dimensione di energia e garantisce E_i>E_f quando il fotone ha energia positiva. La stessa origine energetica dei livelli è necessaria per interpretare la differenza.

Passaggi: E_\gamma=E_i-E_f;  E_i=E_\gamma+E_f

Risposta proposta: E_i = E_γ + E_f.

Distrattori: Le differenze non ricostruiscono il livello iniziale. Il prodotto avrebbe dimensione energia al quadrato e il quoziente sarebbe puro: le unità scartano queste ultime due proposte già prima dei numeri.

## AR-u7-gamma-transition-energy-10 — Due livelli moltiplicati fra prove

Ipotesi e percorso manuale d’autore: Inserisco i fattori nei due termini del salto prima di formare il rapporto. Il denominatore iniziale è positivo e anche il nuovo salto deve esserlo: non bastano fattori singolarmente positivi per garantire una transizione emittente. Se entrambi i fattori sono uguali, solo allora l’intero salto scala di quel fattore.

Passaggi: E_{\gamma,B}=\kappa_1E_i-\kappa_2E_f;  R=\frac{\kappa_1E_i-\kappa_2E_f}{E_i-E_f}

Risposta proposta: (κ₁ E_i − κ₂ E_f) / (E_i − E_f).

Distrattori: Il rapporto o prodotto dei soli fattori perde i pesi dei livelli. Il segno più somma energie che il nucleo conserva e cede; κ₁−κ₂ darebbe zero se entrambi fossero uno, mentre il rapporto corretto sarebbe uno.

## AR-u7-gamma-transition-energy-11 — Salti molto diversi

Ipotesi e percorso manuale d’autore: Il salto A vale ottanta keV e il salto B un keV. Il rapporto delle energie dei fotoni è quindi uno su ottanta. Usare soltanto il rapporto degli stati iniziali o finali perderebbe la sottrazione che determina l’emissione.

Passaggi: E_{\gamma,A}=80\,\mathrm{keV};  E_{\gamma,B}=1\,\mathrm{keV};  R=\frac1{80}

Risposta proposta: 1/80.

Distrattori: Ottanta inverte il confronto. 1/50 confronta soltanto E_i e 1/20 soltanto E_f; uno suppone uguali due salti assegnati diversi.

## AR-u7-gamma-transition-energy-12 — Media di due energie di fotone

Ipotesi e percorso manuale d’autore: Calcolo i salti ottanta e uno, poi divido la somma per due: la media è 81/2 keV. Qui la legge è lineare nei livelli e la media coincide con il salto fra i livelli medi 51 e 21/2 keV. Quei livelli medi sono una costruzione matematica, non la previsione di livelli realmente disponibili in un terzo nucleo.

Passaggi: \overline E_\gamma=\frac{80+1}{2}\,\mathrm{keV};  \overline E_\gamma=\frac{81}{2}\,\mathrm{keV};  51-\frac{21}{2}=\frac{81}{2}

Risposta proposta: 81/2.

Distrattori: Ottantuno somma senza mediare. Ottanta e uno ignorano una delle letture; cinquantuno media solo i livelli iniziali. La media energetica non rende continui gli spettri nucleari reali.

## AR-u7-gamma-transition-energy-13 — Il livello finale richiesto

Ipotesi e percorso manuale d’autore: Il nuovo salto deve essere un keV. Perciò il livello finale di B è due meno uno, cioè un keV. Rispetto ai venti keV iniziali richiesti nel denominatore il rapporto è uno su venti, non il rapporto dei salti.

Passaggi: E_{\gamma,B}=1\,\mathrm{keV};  E_{f,B}=(2-1)\,\mathrm{keV};  E_{f,B}=1\,\mathrm{keV};  E_{f,B}/E_{f,A}=\frac1{20}

Risposta proposta: 1/20.

Distrattori: Venti inverte il rapporto. 1/80 confronta i fotoni, 1/50 i livelli iniziali; uno lascerebbe E_f,B a 20 keV, sopra il livello iniziale di 2 keV e fuori dal dominio emittente.

## AR-u7-gamma-transition-energy-14 — Guadagno prima del bilancio

Ipotesi e percorso manuale d’autore: Il riferimento ha salto ottanta, così g=3 unità strumentali per keV. La lettura tre corrisponde a un keV emesso. Aggiungendo il keV del livello finale ricostruisco E_i=2 keV.

Passaggi: g=240/80;  g=3;  E_\gamma=1\,\mathrm{keV};  E_i=(1+1)\,\mathrm{keV};  E_i=2\,\mathrm{keV}

Risposta proposta: 2 keV.

Distrattori: Quattro sommerebbe direttamente il display tre al livello finale uno, senza togliere il guadagno. Uno sarebbe il solo salto e zero invertirebbe il bilancio.

## AR-u7-gamma-transition-energy-15 — Due riferimenti e uno zero strumentale

Ipotesi e percorso manuale d’autore: I salti di riferimento sono ottanta e uno. Dalle differenze ricavo g=158/79=2 e poi b=1. La lettura 201 indica un salto di cento keV; al livello finale venti sommo quel salto e ottengo centoventi.

Passaggi: g=\frac{161-3}{80-1};  g=2;  b=1;  E_{\gamma,C}=100\,\mathrm{keV};  E_{i,C}=120\,\mathrm{keV}

Risposta proposta: 120 keV.

Distrattori: 241/2 keV ometterebbe l’offset: 201/2+20. Cento sarebbe il solo salto, duecentoventuno sommerebbe direttamente la lettura al livello finale.

## AR-u7-gamma-transition-energy-16 — Livelli legati da un vincolo

Ipotesi e percorso manuale d’autore: Il livello iniziale contiene cinque volte l’energia del livello finale, perciò il salto ne contiene quattro. Da 4 E_f=80 keV ricavo E_f=20 keV e quindi E_i=100 keV. Entrambi i livelli sono positivi e nell’ordine richiesto.

Passaggi: E_\gamma=5E_f-E_f;  E_\gamma=4E_f;  E_f=80/4\,\mathrm{keV};  E_f=20\,\mathrm{keV}

Risposta proposta: 20 keV.

Distrattori: Sedici userebbe cinque al posto della differenza quattro e darebbe un salto di 64 keV. Ottanta identifica il salto col livello finale; valori negativi violano il dominio e non c’è una libertà di scala dopo la misura assoluta.
