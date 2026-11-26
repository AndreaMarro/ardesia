# critical-angle-sine-258 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-02.json`, SHA `43ad92dba82bc16829a60f11071965f30bf0d8e115def3c1dc5eb2a3e229aeb7`. Tutti gli 80 prompt B255–259 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B255–259 commit d0628ef6, SHA 5b685efd1f9081ea829990d63cf50291ffc298c922b8aac2b169b8de5cdaa3e4, ricevuta solo come hash/percorso e mai aperta; B per A250–254 commit 7518f76e, SHA 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L08 nuclei e transizioni, L09 rifrazione e angolo limite (prereq L06), L10 lenti (prereq L09), tutti letti integralmente.

Riferimenti primari consultati per le leggi: [OpenStax, trasformazioni nucleari](https://openstax.org/books/university-physics-volume-3/pages/10-key-equations), [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello didattico, non una prescrizione clinica o una garanzia di realizzabilità di catene nucleari.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello1 vettore incidente(dx80,dy−80√3), lungo160, seno1/2=sin30°; trasmesso radente. Pannello2 vettori(dx120,dy∓120) simmetrici rispetto alla normale, angoli45°. Barre scala480 per seno:240,320,280 per1/2,2/3,7/12.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-critical-angle-sine-01 — Al limite il raggio è radente

Ipotesi e percorso manuale d’autore: Applico Snell proprio al limite: n_i sinθ_c=n_e sin 90°. Poiché il seno di novanta gradi è uno, divido l’indice esterno per quello interno e ottengo un mezzo. In questo caso notevole θ_c=30°, ma il quesito richiede il suo seno.

Passaggi: n_i\sin\theta_c=n_e;  s_c=\frac{n_e}{n_i};  s_c=\frac12;  \theta_c=30^\circ

Risposta proposta: 1/2.

Distrattori: Due inverte il rapporto e non è un seno reale. Uno descriverebbe un limite a 90°, assente con questi indici distinti; un quarto introduce un quadrato e il segno negativo esce dal ramo 0<θ_c<90°.

## AR-u7-critical-angle-sine-02 — Un rapporto di indici

Ipotesi e percorso manuale d’autore: Il seno è un numero puro e gli indici ottici sono anch’essi rapporti di velocità. Il rapporto n_e/n_i conserva quindi la dimensione uno. I gradi possono esprimere θ_c, che è una grandezza diversa da s_c.

Passaggi: [n_i]=[n_e]; [n_e]=1;  [s_c]=1

Risposta proposta: 1, adimensionale.

Distrattori: Gradi si riferisce all’angolo stesso; metri, secondi e inversi di metro non sono unità di questo rapporto. Una risposta numerica del seno non va corredata di gradi.

## AR-u7-critical-angle-sine-03 — Quando si ha riflessione totale?

Ipotesi e percorso manuale d’autore: Occorre prima il verso dal maggiore al minore indice. La soglia si trova con sinθ_c=n_e/n_i. Soltanto per θ_i>θ_c Snell richiederebbe un seno trasmesso maggiore di uno, quindi manca un raggio trasmesso propagante nel secondo mezzo; θ_i=θ_c è il limite radente. Può esistere un campo evanescente: assenza di raggio propagante non significa assenza di ogni campo.

Passaggi: n_i>n_e;  \sin\theta_c=\frac{n_e}{n_i};  \theta_i>\theta_c

Risposta proposta: Arrivo dal mezzo di indice maggiore con θ_i maggiore dell’angolo limite.

Distrattori: Dal minore al maggiore indice esiste sempre una direzione trasmessa per un’incidenza ammessa. Sotto soglia si rifrange e all’incidenza normale non si supera un angolo limite positivo. Indici diversi da soli non bastano.

## AR-u7-critical-angle-sine-04 — Aumenta l’indice esterno

Ipotesi e percorso manuale d’autore: Divido entrambi gli indici esterni per due. Il seno limite passa da un mezzo a tre quarti, ancora minore di uno perché l’indice esterno resta inferiore a quello interno. L’angolo limite cresce, ma il suo rapporto non coincide in generale col rapporto dei seni.

Passaggi: s_{c,A}=\frac12;  s_{c,B}=\frac{3/2}{2};  s_{c,B}=\frac34

Risposta proposta: Da 1/2 a 3/4.

Distrattori: Un terzo darebbe un andamento inverso rispetto a n_e. Tre mezzi non è un seno reale, il valore invariato trascura il secondo mezzo e 9/16 sostituisce un quadrato alla legge.

## AR-u7-critical-angle-sine-05 — Ricostruire l’indice esterno

Ipotesi e percorso manuale d’autore: Riordino la legge come n_e=n_i s_c. Il prodotto di due per un mezzo vale uno, positivo e inferiore a due. Questa verifica di ordine distingue il mezzo esterno meno rifrangente da quello di partenza.

Passaggi: n_e=n_i s_c;  n_e=2\cdot\frac12;  n_e=1

Risposta proposta: 1 1.

Distrattori: Quattro dividerebbe n_i per s_c e invertirebbe l’ordine dei mezzi. Due eliminerebbe il contrasto d’indice; un mezzo ricopia il seno anziché applicare il prodotto.

## AR-u7-critical-angle-sine-06 — L’indice del mezzo di partenza

Ipotesi e percorso manuale d’autore: Moltiplicando s_c=n_e/n_i per n_i e dividendo per s_c positivo ottengo n_i=n_e/s_c. Un intero diviso per un mezzo vale due. L’indice ottenuto è maggiore di quello esterno e quindi mantiene la possibilità di un limite interno.

Passaggi: n_i=\frac{n_e}{s_c};  n_i=\frac1{1/2};  n_i=2

Risposta proposta: 2 1.

Distrattori: Un mezzo moltiplica invece di dividere e farebbe partire il raggio dal mezzo meno rifrangente. Uno non consentirebbe un limite strettamente minore di 90°; quattro predirebbe seno limite 1/4.

## AR-u7-critical-angle-sine-07 — Cambiare il mezzo interno

Ipotesi e percorso manuale d’autore: I seni limite sono un mezzo e un terzo. Il loro rapporto è(1/3)/(1/2)=due terzi. A indice esterno fissato, un indice interno maggiore riduce il seno e l’angolo della soglia.

Passaggi: s_{c,A}=\frac12;  s_{c,B}=\frac13;  R=\frac23

Risposta proposta: 2/3.

Distrattori: 3/2 inverte il confronto. Un terzo e un mezzo sono le singole uscite, uno ignora il nuovo mezzo interno.

## AR-u7-critical-angle-sine-08 — Scarto con segno al limite

Ipotesi e percorso manuale d’autore: Il rapporto corretto vale un mezzo. La proposta uno lo supera di un mezzo: lo scarto richiesto è positivo e adimensionale. Non è la differenza fra 90° e 30°, perché il compito riguarda i seni.

Passaggi: s_c=\frac12;  \delta s=1-\frac12;  \delta s=\frac12

Risposta proposta: 1/2.

Distrattori: −1/2 inverte la sottrazione, uno copia la proposta e due è il rapporto. Zero accetterebbe un limite incompatibile con indici distinti uno e due.

## AR-u7-critical-angle-sine-09 — L’inversa del rapporto

Ipotesi e percorso manuale d’autore: Moltiplico il rapporto s_c=n_e/n_i per il denominatore n_i. L’inversa n_e=n_i s_c conserva l’ordine n_e<n_i se 0<s_c<1. Non si deve confondere il seno incidente limite con il seno trasmesso, che al limite vale uno.

Passaggi: s_c=\frac{n_e}{n_i};  n_e=n_i s_c;  0<s_c<1

Risposta proposta: n_e = n_i s_c.

Distrattori: Dividere per s_c produrrebbe n_e>n_i; il secondo quoziente, la differenza e il quadrato non ricostruiscono Snell. Tutti gli indici sono puri: qui l’analisi delle unità da sola non seleziona la legge.

## AR-u7-critical-angle-sine-10 — Due mezzi modificati insieme

Ipotesi e percorso manuale d’autore: Sostituisco i fattori nel rapporto degli indici e cancello quello iniziale. Il risultato è κ₁/κ₂, purché il nuovo ordineκ₂n_i>κ₁n_e rimanga valido. Un fattore positivo non autorizza a superare il confine fra i due ordini di rifrazione.

Passaggi: s_{c,B}=\frac{\kappa_1n_e}{\kappa_2n_i};  R=\frac{\kappa_1}{\kappa_2};  \kappa_2n_i>\kappa_1n_e

Risposta proposta: κ₁ / κ₂.

Distrattori: Il prodotto tratta l’indice interno come diretto; il rapporto inverso scambia i ruoli. Il quadrato introduce una legge diversa e la somma non restituisce uno a fattori entrambi unitari.

## AR-u7-critical-angle-sine-11 — Due coppie di indici

Ipotesi e percorso manuale d’autore: I rapporti degli indici sono un mezzo e due terzi. Divido due terzi per un mezzo e ottengo quattro terzi. Gli indici di B mantengono l’ordine tre maggiore di due, quindi il seno limite resta minore di uno anche se supera quello di A.

Passaggi: s_{c,A}=\frac12;  s_{c,B}=\frac23;  R=\frac{2/3}{1/2};  R=\frac43

Risposta proposta: 4/3.

Distrattori: Tre quarti inverte B/A; due segue soltanto n_e. Due terzi e un mezzo sono le uscite singole, non il loro confronto.

## AR-u7-critical-angle-sine-12 — La media delle due soglie in seno

Ipotesi e percorso manuale d’autore: Un mezzo più due terzi vale sette sesti; dividendo per due ottengo sette dodicesimi. Gli indici medi 3/2 e 5/2 darebbero invece 3/5, maggiore di 7/12 di 1/60. Non si chiede una media degli angoli né l’angolo il cui seno è questa media.

Passaggi: \overline s_c=\frac{1/2+2/3}{2};  \overline s_c=\frac7{12};  s_{c,\rm dati\ medi}=\frac{3/2}{5/2};  s_{c,\rm dati\ medi}=\frac35

Risposta proposta: 7/12.

Distrattori: Tre quinti applica la legge agli ingressi medi. Sette sesti omette la divisione per due ed è anche maggiore di uno; le altre risposte ripetono una sola lettura.

## AR-u7-critical-angle-sine-13 — Il nuovo indice interno richiesto

Ipotesi e percorso manuale d’autore: La soglia B deve avere seno due terzi. Dall’inversa n_i,B=n_e,B/s_c,B ottengo 2/(2/3)=3. Divido per l’indice interno iniziale due e ricavo 3/2; il nuovo ordine 3>2 è rispettato.

Passaggi: s_{c,B}=\frac23;  n_{i,B}=\frac2{2/3};  n_{i,B}=3;  n_{i,B}/n_{i,A}=\frac32

Risposta proposta: 3/2.

Distrattori: Due terzi inverte il rapporto.4/3 copia il fattore delle uscite, due il fattore del solo indice esterno; uno darebbe indici B uguali e uscirebbe dal dominio di limite interno.

## AR-u7-critical-angle-sine-14 — Taratura senza offset

Ipotesi e percorso manuale d’autore: Il primo seno vale un mezzo e quindi g=3. Il display due indica s_c=2/3; moltiplicando per n_i=3 ottengo n_e=2. Il mezzo esterno resta meno rifrangente di quello interno.

Passaggi: g=\frac{3/2}{1/2};  g=3;  s_c=\frac23;  n_e=3\cdot\frac23;  n_e=2

Risposta proposta: 2 1.

Distrattori: Sei userebbe il display come seno e violerebbe l’ordine. Due terzi sarebbe il seno, tre porterebbe alla parità degli indici e uno non riprodurrebbe il display nuovo.

## AR-u7-critical-angle-sine-15 — Una taratura affine

Ipotesi e percorso manuale d’autore: I seni di riferimento sono 1/2 e 2/3. La differenza del display 1/3 divisa per quella fisica 1/6 dàg=2; segueb=1. La lettura 5/2 dà s_c=(5/2−1)/2=3/4; moltiplico per l’indice interno due e ottengo n_e=3/2.

Passaggi: g=\frac{7/3-2}{2/3-1/2};  g=2;  b=1;  s_{c,C}=\frac{5/2-1}{2};  s_{c,C}=\frac34;  n_{e,C}=\frac32

Risposta proposta: 3/2.

Distrattori: 5/2 omette l’offset e produrrebbe un indice esterno maggiore di quello interno.3/4 si ferma al seno; uno ripete il primo riferimento e due eliminerebbe il contrasto d’indice.

## AR-u7-critical-angle-sine-16 — Un rapporto non determina due indici

Ipotesi e percorso manuale d’autore: Sostituendo il vincolo ottengo sempre s_c=(n_i/2)/n_i=1/2. Non esiste un dato che fissi la scala comune: per esempio(1,2) e(3/2,3) sono entrambe ammesse, come ogni loro comune riscalamento positivo nel dominio assegnato. La conclusione riguarda indici ideali del modello, non la disponibilità illimitata di materiali reali.

Passaggi: s_c=\frac{n_i/2}{n_i};  s_c=\frac12;  n_i>0;  n_e=n_i/2

Risposta proposta: Infinite coppie positive con n_e = n_i/2.

Distrattori: Una o due coppie non esauriscono la libertà continua. La risposta «Nessuna coppia» è smentita dagli esempi; fissare l’aria a indice uno imporrebbe un dato aggiuntivo che qui non è assegnato.
