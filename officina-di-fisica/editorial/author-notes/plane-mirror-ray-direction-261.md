# plane-mirror-ray-direction-261 — note di autoria

16 candidati astra/1 DRAFT. Calcoli proposti dall’autore per una revisione distinta, non una certificazione scientifica propria. SCI propria, approvazione umana e UI del prodotto NOT_RUN. Nessuna modifica al registro o alla pubblicazione.

Fonte Ardesia `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U7-03.json`, SHA `6db63e941006bc0ceed36d502c46b1d48d814a82c12874e6121e37c3d25a904e`. Tutti i 32 prompt B261–262 sono stati letti prima dei candidati; estrazione allowlist id/prompt/familyId/lawFamily, senza opzioni, chiavi o soluzioni originali.

Entrambe le primarie sono congelate prima della prima candidatura: A per B261–262 commit 46b0e987, SHA d5f076f221127f55926b8db14609e5903199f8f03b8d2bfb2e752b8df003583d, ricevuta solo come hash/percorso e mai aperta; B per A260 commit 41d26dcb, SHA 91220f73e8017e5d93177938133c038760e8f8a53a1521decfe907b72d089f55.

Catalogo C5 al pin Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C5.json SHA dac4490e6a900f5da191bf7a1f5b8463ddc57c8bbaa36cb7a4a375c70fa77422: L09 riflessione, rifrazione e angolo limite (prereq L06) e L10 lenti (prereq L09), letti integralmente.

Riferimenti primari consultati per le leggi: [Snell](https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction), [riflessione totale](https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection), [lenti sottili](https://openstax.org/books/college-physics-2e/pages/25-6-image-formation-by-lenses). Nessun testo o esercizio riprodotto; i parametri assegnati sono un modello geometrico didattico con ipotesi dichiarate.

Una sola pipeline esistente: assemble_family/law_steps, due assembly identiche, import canonico su SQLite temporaneo 16 salvati poi 0 nuovi/16 invariati. I 991 pubblicati rimangono byte-identici e nessun live head è creato. Operazioni sequenziali sotto mutex condiviso con guardia ≥2 GiB; importatore mantenuto al budget originale di 60 s. Le ricevute attestano soltanto exit reali, non una review scientifica.

Geometria d’autore per il revisore (coordinate intrinseche SVG, non unità fisiche o pixel CSS): Pannello1 O(300,320), retta specchio φ45° da160,460 a440,180; normale135° da180,200 a420,440. Vettore incidente lungo180 con dx90√3,dy−90:α30°; riflesso dx90,dy−90√3:β60°. Entrambe le semirette nello stesso semipiano; θi=θr75°. Barre scala3 coordinate/grado, larghezze180/315/247.5 per60/105/82.5. Grafico orig150,1530, scale4/gradoφ e2/gradoβ, β=2φ−30, bordi aperti φ30/90.

Il PNG nativo a piena altezza è stato effettivamente aperto e letto dall’autore, confrontandolo con XML. Resa asset-only; nessuna UI responsive del prodotto o accettazione scientifica anticipata.

## AR-u7-plane-mirror-ray-direction-01 — Una direzione rispetto all’asse

Ipotesi e percorso manuale d’autore: La riflessione ribalta la componente normale della propagazione e conserva quella tangenziale. Le direzioni α e β sono simmetriche rispetto alla retta di angolo φ, quindi β−φ=φ−α. Due volte quarantacinque meno trenta vale sessanta gradi. Gli angoli fisici di incidenza e riflessione dalla normale sono entrambi 75°, non α e β.

Passaggi: \beta-\varphi=\varphi-\alpha;  \beta=2\varphi-\alpha;  \beta=2\cdot45^\circ-30^\circ;  \beta=60^\circ

Risposta proposta: 60 gradi.

Distrattori: Trenta confonde la legge θ_r=θ_i con l’uguaglianza delle direzioni dall’asse. Quindici è φ−α, non β; settantacinque è qui l’angolo dalla normale e centoventi non soddisfa la simmetria assegnata.

## AR-u7-plane-mirror-ray-direction-02 — Quale unità per una direzione angolare?

Ipotesi e percorso manuale d’autore: Una direzione piana si può specificare con un angolo, qui misurato in gradi. L’unità SI dell’angolo è il radiante, che è adimensionale; gradi e radianti sono due scale angolari, non lunghezze o tempi. Nelle opzioni solo gradi indica una scala angolare.

Passaggi: 180^\circ=\pi\,\mathrm{rad}

Risposta proposta: gradi.

Distrattori: Centimetri, secondi, joule e becquerel misurano rispettivamente lunghezza, tempo, energia e attività. La scelta dell’origine degli angoli non cambia il tipo della grandezza.

## AR-u7-plane-mirror-ray-direction-03 — La legge usa la normale

Ipotesi e percorso manuale d’autore: La legge speculare uguaglia gli angoli dalla normale, con raggio incidente e riflesso nello stesso piano normale alla superficie. Non impone l’uguaglianza di due azimut misurati da un asse esterno. Anche misurando entrambi dalla superficie si ottengono complementi uguali, ma la definizione della legge qui adottata è quella dalla normale.

Passaggi: \theta_r=\theta_i

Risposta proposta: θ_r = θ_i.

Distrattori: Raddoppiare o dimezzare non conserva la simmetria. La somma vale 90° soltanto nel caso particolare di due angoli da 45°, non sempre. L’ultima opzione sostituisce la superficie alla normale richiesta.

## AR-u7-plane-mirror-ray-direction-04 — Ruotare lo specchio, lasciare fermo il raggio

Ipotesi e percorso manuale d’autore: La legge β=2φ−α ha coefficiente due per l’orientamento dello specchio. Ruotare la retta di 15° con propagazione incidente fissa ruota quella riflessa di 30°: da sessanta a novanta. La variazione doppia riguarda β in questo confronto, non θ_r come funzione di θ_i.

Passaggi: \beta_A=60^\circ;  \beta_B=2\cdot60^\circ-30^\circ;  \beta_B=90^\circ;  \Delta\beta=30^\circ

Risposta proposta: Da 60° a 90°.

Distrattori: Settantacinque aggiunge una sola volta la rotazione dello specchio. Centoventi omette α, sessanta ignora la nuova retta e quarantacinque ha il verso della variazione sbagliato.

## AR-u7-plane-mirror-ray-direction-05 — Ricostruire la retta dello specchio

Ipotesi e percorso manuale d’autore: La retta dello specchio biseca le due direzioni di propagazione nel ramo scelto. Sommo sessanta e trenta e divido per due: quarantacinque gradi. Il controllo 0<30<45<90 conserva il dominio e la sostituzione restituisce β=60°.

Passaggi: 2\varphi=\beta+\alpha;  \varphi=\frac{\beta+\alpha}{2};  \varphi=\frac{60^\circ+30^\circ}{2};  \varphi=45^\circ

Risposta proposta: 45 gradi.

Distrattori: Quindici dimezza la differenza anziché la somma. Novanta omette la divisione per due e trenta copia α, portando al bordo radente escluso.

## AR-u7-plane-mirror-ray-direction-06 — La propagazione prima dell’urto

Ipotesi e percorso manuale d’autore: Porto α dall’altra parte nella simmetria β=2φ−α: α=2φ−β. Novanta meno sessanta vale trenta. Non si usa il verso opposto della semiretta incidente, che avrebbe direzione 210°: α indica il vettore che arriva allo specchio.

Passaggi: \alpha=2\varphi-\beta;  \alpha=90^\circ-60^\circ;  \alpha=30^\circ

Risposta proposta: 30 gradi.

Distrattori: Centocinquanta sommerebbe β, mentre meno trenta invertirebbe la differenza. Quindici dimezza ancora il risultato senza una legge;210° inverte il verso di propagazione incidente.

## AR-u7-plane-mirror-ray-direction-07 — Cambiare il raggio, mantenere la retta

Ipotesi e percorso manuale d’autore: A dà sessanta gradi; B dà novanta meno quindici, cioè settantacinque. Il rapporto dei numeri delle direzioni nel riferimento fissato è 75/60=5/4. Non è il rapporto degli angoli dalla normale e dipende dall’asse adottato, che qui resta lo stesso.

Passaggi: \beta_A=60^\circ;  \beta_B=75^\circ;  \beta_B/\beta_A=\frac54

Risposta proposta: 5/4.

Distrattori: Quattro quinti inverte B/A; un mezzo segue soltanto α, due ne inverte il fattore e uno ignora la variazione. L’offset 2φ impedisce una semplice proporzione inversa.

## AR-u7-plane-mirror-ray-direction-08 — Scarto angolare con segno

Ipotesi e percorso manuale d’autore: La direzione corretta è sessanta gradi. Il proposto centoventi la supera di sessanta: lo scarto nel ramo direzionale dichiarato è+60°. Il quoziente sarebbe due, una grandezza diversa dalla differenza angolare richiesta.

Passaggi: \beta=60^\circ;  \delta\beta=120^\circ-60^\circ;  \delta\beta=60^\circ

Risposta proposta: 60.

Distrattori: −60 scambia l’ordine,120 ripete la proposta e due copia il valore numerico del rapporto. Zero non controlla la simmetria. Non si riduce lo scarto modulo 360° perché il ramo è fissato.

## AR-u7-plane-mirror-ray-direction-09 — L’inversa simbolica conserva il ramo

Ipotesi e percorso manuale d’autore: Aggiungo α e divido per due. La formula è valida nel ramo geometrico dichiarato solo se β>α e β+α<180°, così φ resta fra α e 90°. La somma di angoli ha la stessa unità dei due termini e la divisione per due non la elimina.

Passaggi: 2\varphi=\beta+\alpha;  \varphi=\frac{\beta+\alpha}{2};  \beta>\alpha;  \beta+\alpha<180^\circ

Risposta proposta: φ = (β + α) / 2.

Distrattori: La differenza ricostruisce un altro asse, la somma non dimezzata e 2β−α non annullano il coefficiente della legge. α/β è un rapporto puro, non l’angolo cercato.

## AR-u7-plane-mirror-ray-direction-10 — Due fattori su angoli direzionali

Ipotesi e percorso manuale d’autore: Sostituisco i fattori nei due termini della differenza β. Il rapporto non si riduce a un prodotto o quoziente dei soli fattori perché φ e α entrano in una somma algebrica. Il settore deve rimanere valido anche dopo la variazione:0<κ₂α<κ₁φ<90°.

Passaggi: \beta_B=2\kappa_1\varphi-\kappa_2\alpha;  R=\frac{2\kappa_1\varphi-\kappa_2\alpha}{2\varphi-\alpha}

Risposta proposta: (2κ₁φ − κ₂α) / (2φ − α).

Distrattori: I soli fattori perdono il peso due e la sottrazione. Il segno più non rispetta la riflessione; la somma κ₁+κ₂ darebbe due per configurazioni identiche.

## AR-u7-plane-mirror-ray-direction-11 — Entrambi gli orientamenti cambiano

Ipotesi e percorso manuale d’autore: Calcolo ogni direzione: A vale 60°, B vale 120°−15°=105°. Il rapporto 105/60 si riduce a 7/4. Una β maggiore di 90° è una direzione ammessa nel secondo quadrante, non un angolo di incidenza maggiore di 90°.

Passaggi: \beta_A=60^\circ;  \beta_B=105^\circ;  R=\frac{105}{60};  R=\frac74

Risposta proposta: 7/4.

Distrattori: 4/7 inverte il confronto,4/3 segue solo φ e 1/2 solo α. Due non ricostruisce la nuova direzione 105°. Non si confondono le direzioni dall’asse con gli angoli dalla normale.

## AR-u7-plane-mirror-ray-direction-12 — Media aritmetica nel riferimento fissato

Ipotesi e percorso manuale d’autore: Le direzioni nel ramo fissato sono sessanta e centocinque gradi. La loro semisomma vale 165/2°. Qui la legge lineare negli angoli fa coincidere questa media con 2φ_m−α_m usando φ_m=105/2° e α_m=45/2°. La richiesta è una statistica degli angoli nello stesso riferimento, non un calcolo di potenza o intensità del fascio.

Passaggi: \overline\beta=\frac{60+105}{2}\,{}^\circ;  \overline\beta=\frac{165}{2}\,{}^\circ;  \varphi_m=\frac{105}{2}\,{}^\circ;  \alpha_m=\frac{45}{2}\,{}^\circ

Risposta proposta: 165/2.

Distrattori: 165 somma senza mediare;45/2 è la semidifferenza e 60 o 105 ripete una sola configurazione. Non si inventa una differenza fra le due operazioni quando la legge è lineare.

## AR-u7-plane-mirror-ray-direction-13 — Il raggio incidente richiesto dal target

Ipotesi e percorso manuale d’autore: Il target riflesso è 105°. Con la nuova retta a 60° l’inversa dà α_B=120°−105°=15°. Divido per i 30° iniziali e ottengo un mezzo;15° resta strettamente fra zero e 60°.

Passaggi: \beta_B=105^\circ;  \alpha_B=120^\circ-105^\circ;  \alpha_B=15^\circ;  \alpha_B/\alpha_A=\frac12

Risposta proposta: 1/2.

Distrattori: Due inverte il confronto;7/4 e 4/7 appartengono alle uscite. Uno lascerebbe α_B=30° e darebbe β_B=90°, non 105°.

## AR-u7-plane-mirror-ray-direction-14 — Un display dell’azimut

Ipotesi e percorso manuale d’autore: Il riferimento β=60° fissa g=3 per grado. La lettura 315 indica β=105°. Dall’inversa φ=(β+α)/2 ricavo(105°+15°)/2=60°. Il guadagno riguarda il display numerico, non una rotazione dello specchio.

Passaggi: g=3\,({}^\circ)^{-1};  \beta=105^\circ;  \varphi=\frac{105^\circ+15^\circ}{2};  \varphi=60^\circ

Risposta proposta: 60 gradi.

Distrattori: 165° tratterebbe il display come angolo e uscirebbe dal settore φ<90°. Quarantacinque ripete la retta precedente; centocinque è β e non φ.

## AR-u7-plane-mirror-ray-direction-15 — Guadagno e offset prima dell’inversa

Ipotesi e percorso manuale d’autore: I riferimenti fisici sono β=60° e 105°. Le differenze danno g=90/45=2 per grado; segue b=1. La lettura 181 indica β_C=90°. Con α=30° la retta ricostruita è(90°+30°)/2=60°.

Passaggi: g=\frac{211-121}{105-60}\,({}^\circ)^{-1};  g=2\,({}^\circ)^{-1};  b=1;  \beta_C=90^\circ;  \varphi_C=60^\circ

Risposta proposta: 60 gradi.

Distrattori: 241/4° ometterebbe l’offset:β_C=181/2° e φ_C=(181/2+30)/2°.105° ometterebbe il guadagno dopo b e violerebbe φ<90°. Novanta copia β_C senza l’inversa.

## AR-u7-plane-mirror-ray-direction-16 — Il vincolo unisce le due direzioni

Ipotesi e percorso manuale d’autore: Sostituisco il vincolo inβ=2φ−α: due volte 3α/2 meno α vale 2α. La misura fissa α=30° e quindi φ=45°. Il dato assoluto non è ridondante; la soluzione rispetta il settore senza ricorrere a rami periodici.

Passaggi: \beta=2\left(\frac32\alpha\right)-\alpha;  \beta=2\alpha;  \alpha=30^\circ;  \varphi=45^\circ

Risposta proposta: 30 gradi.

Distrattori: Sessanta omette il coefficiente due e porterebbe φ al bordo 90°, escluso. Quindici introdurrebbe un altro dimezzamento e non ricostruirebbe β. Infinite soluzioni richiederebbero che la misura non fissasse α, cosa che qui non accade.
