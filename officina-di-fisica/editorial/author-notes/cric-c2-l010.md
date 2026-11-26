# cric-c2-l010 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C2.json, SHA7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23. Letti individualmente soltanto enunciati e metadati allowlist, insieme alle lezioni C2-L006–L010 e ai loro prerequisiti reali. Nessuna risposta, opzione, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche prima dei candidati: B sui cinquanta A001–050, commit9dc54dba, SHA34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; A sui cinquanta B051–100, commit026127465e30476b3e8bdb874d9bd98520a0b8d2, SHAa51ecd2856370b38a67fd59f09b4dbce23eda319c27e5d379428b9fd67b1dc92. La primaria A è stata ricevuta soltanto come hash/percorso e non aperta durante l’autoria. Modello B per futura review A congelato in e37686eb, SHA02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc, prima di aprire qualunque candidato A C2.

Sono dieci problemi differenti, non sedici variazioni di una famiglia artificiale. ID, corso, skill, famiglia, difficoltà, prerequisiti, ordine, flag exam e versione individuale originali conservati. Nuova version=baseVersion+1. Procedura manuale esatta, ipotesi fisiche e distrattori scritti per ciascun compito.

Unico assembler/importatore canonico; nessuna seconda ETL. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file helper è copiato byte-esatto per l’esecuzione e non attribuito a questa autoria.

Due assembly effettive identiche e import canonico entro il budget originale60 s: dieci salvati DRAFT, poi zero salvati/dieci invariati in SQLite temporaneo. I991 pubblicati e tutti i live head storici restano byte-invariati. Operazioni reali terminali0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto insieme all’XML: prova asset-only, non UI prodotto. Nessuna propria review scientifica, approvazione umana o pubblicazione: SCI/UI prodotto/human NOT_RUN, DRAFT.

## C2-Q091 — Perché una piccola goccia tende alla sfera

Versione 2, base 1; famiglia forma-di-una-piccola-goccia-libera; difficoltà 2.

Modello e passaggi: Creare area costa energia γA. Con γ positiva e volume conservato, una forma con area minore ha energia superficiale minore; fra le forme libere la sfera è quella di area minima per quel volume. Non si sta affermando che ogni goccia reale sia sferica: qui sono escluse le forzanti che la deformerebbero.

Leggi e calcolo manuale: E_s=\gamma A;  \gamma>0;  V=\mathrm{costante};  \min E_s\Longleftrightarrow\min A

Risposta d’autore proposta: La sfera minimizza l’area e quindi l’energia superficiale a volume fissato.

Distrattori e limiti: Massimizzare l’area aumenterebbe l’energia. Non occorre γ=0: è proprio il costo positivo a selezionare l’area minore. Annullare il volume perderebbe liquido, mentre la gravità rilevante è esclusa dal modello.

## C2-Q092 — Il costo di una nuova interfaccia

Versione 3, base 2; famiglia energia-per-creare-superficie; difficoltà 2.

Modello e passaggi: Converto prima l’area: un centimetro quadrato è 10⁻⁴ m², quindi ΔA=3·10⁻⁴ m². La tensione è 1/20 N/m, equivalente a 1/20 J/m². Il prodotto è (3/20)·10⁻⁴ J=15·10⁻⁶ J, cioè 15 µJ. Il conteggio riguarda una sola interfaccia, senza un fattore due aggiuntivo.

Leggi e calcolo manuale: \Delta A=3\,10^{-4}\,\mathrm{m^2};  \Delta E=\gamma\Delta A;  \Delta E=15\,10^{-6}\,\mathrm J;  \Delta E=15\,\mathrm{\mu J}

Risposta d’autore proposta: 15 µJ.

Distrattori e limiti: 30 µJ conterebbe due interfacce invece di una. Convertire cm² come una lunghezza introdurrebbe il fattore sbagliato. Il rapporto γ/ΔA non è un’energia e invertire il prodotto cambia anche le dimensioni.

## C2-Q093 — Due facce tirano lo stesso bordo

Versione 2, base 1; famiglia un-bordo-mobile-sul-telaio; difficoltà 2.

Modello e passaggi: Ogni faccia contribuisce γℓ; essendo due, il modulo totale è 2γℓ. Porto 4 cm a 1/25 m e 0,025 a 1/40: 2/(40·25)=1/500 N. Poiché 1 mN=1/1000 N, il risultato è 2 mN. Non si raddoppia la lunghezza fisica: si contano le due interfacce che agiscono sullo stesso bordo.

Leggi e calcolo manuale: F=2\gamma\ell;  \ell=\frac1{25}\,\mathrm m;  F=\frac1{500}\,\mathrm N;  F=2\,\mathrm{mN}

Risposta d’autore proposta: 2 mN.

Distrattori e limiti: Un millinewton conterebbe soltanto una faccia. Usare 4 come metri farebbe crescere la forza di cento volte. N/m è l’unità di γ, non quella della forza dopo il prodotto con ℓ.

## C2-Q094 — Un capillare non bagnante

Versione 2, base 1; famiglia menisco-non-bagnante; difficoltà 2.

Modello e passaggi: La quota h positiva verso l’alto soddisfa h=2γ cosθ/(ρgr). Tutti i fattori tranne il coseno sono positivi; cos120°=−1/2. Quindi h<0: il livello interno è depresso rispetto al riferimento esterno. Il segno non è un’energia negativa né un’altezza assoluta rispetto al pavimento.

Leggi e calcolo manuale: h=\frac{2\gamma\cos\theta}{\rho gr};  \cos120^\circ=-\frac12;  h<0

Risposta d’autore proposta: Più basso: si ha depressione capillare.

Distrattori e limiti: La risalita richiede cosθ positivo, non un angolo qualunque. Il coseno è zero a 90°, non a 120°. La depressione del livello non elimina la massa di liquido né rende indeterminata la previsione del modello.

## C2-Q095 — La goccia piccola richiede più pressione

Versione 2, base 1; famiglia due-raggi-e-due-gocce; difficoltà 2.

Modello e passaggi: Per una goccia sferica Δp=2γ/R. Nel rapporto si cancella la tensione superficiale: Δp_piccola/Δp_grande=R_grande/R_piccola=4. Moltiplico 30 Pa per quattro e ottengo 120 Pa. Si confrontano differenze interno meno esterno, non necessariamente pressioni assolute uguali fra le due prove.

Leggi e calcolo manuale: \Delta p=\frac{2\gamma}{R};  \frac{\Delta p_{\rm piccola}}{\Delta p_{\rm grande}}=\frac{4}{1};  \Delta p_{\rm piccola}=120\,\mathrm{Pa}

Risposta d’autore proposta: 120 Pa.

Distrattori e limiti: 15/2 Pa invertirebbe la dipendenza dal raggio. Trenta ignorerebbe la diversa curvatura; 480 Pa userebbe una dipendenza quadratica inversa che non appartiene alla legge di Laplace.

## C2-Q096 — Cambiare la parete, non il liquido

Versione 2, base 1; famiglia capillari-di-materiali-diversi; difficoltà 2.

Modello e passaggi: La legge contiene il fattore cosθ. Densità,γ,g,r sono comuni e si cancellano: h₆₀/h₀=cos60°/cos0°=(1/2)/1=1/2. Entrambi i coseni sono positivi, dunque entrambe le quote sono risalite. La natura della parete entra attraverso l’angolo di contatto.

Leggi e calcolo manuale: \frac{h_{60}}{h_0}=\frac{\cos60^\circ}{\cos0^\circ};  \frac{h_{60}}{h_0}=\frac12

Risposta d’autore proposta: La seconda è metà della prima.

Distrattori e limiti: Stesso liquido non implica stesso angolo sulla parete. Il reciproco due invertirebbe i tubi. Livello nullo richiederebbe 90° e depressione un angolo superiore a 90° nel modello.

## C2-Q097 — La curvatura nulla non aggiunge pressione

Versione 2, base 1; famiglia una-superficie-senza-curvatura; difficoltà 1.

Modello e passaggi: La forma generale usa le due curvature principali: Δp=γ(1/R₁+1/R₂). Una superficie piana ha entrambe le curvature zero, quindi questo contributo è nullo. Non si sta affermando che la pressione assoluta del fluido sia zero, né che sparisca ogni eventuale gradiente idrostatico lontano dall’interfaccia.

Leggi e calcolo manuale: \frac1{R_1}=0;  \frac1{R_2}=0;  \Delta p_{\rm curvatura}=0

Risposta d’autore proposta: Nulla.

Distrattori e limiti: Il raggio infinito ha reciproco zero, non infinito. 2γ senza una lunghezza al denominatore non ha dimensione di pressione. La pressione atmosferica è un riferimento esterno, non una curvatura.

## C2-Q098 — Una tensione ridotta nel medesimo capillare

Versione 2, base 1; famiglia risalita-dopo-cambio-di-liquido; difficoltà 2.

Modello e passaggi: Con r,ρ,g e cosθ comuni, h è direttamente proporzionale a γ. Il nuovo rapporto è 7/10: moltiplico 20 mm per 7/10 e ottengo 14 mm. La risalita resta positiva e più bassa, coerentemente con la minore forza superficiale a parità del peso per unità di altezza.

Leggi e calcolo manuale: \frac{h_B}{h_A}=\frac{\gamma_B}{\gamma_A};  \frac{h_B}{h_A}=\frac7{10};  h_B=14\,\mathrm{mm}

Risposta d’autore proposta: 14 mm.

Distrattori e limiti: Sei millimetri è la diminuzione 20−14, non l’altezza finale. 200/7 mm invertirebbe il rapporto; venti ignorerebbe la nuova tensione. Dimezzare automaticamente non usa il 70% assegnato.

## C2-Q099 — Otto gocce diventano una

Versione 2, base 1; famiglia coalescenza-di-otto-gocce; difficoltà 3.

Modello e passaggi: Conservo prima il volume: R³=8r³, perciò il nuovo raggio è R=2r. L’area finale è 4π(2r)²=16πr², mentre quella iniziale totale è 8·4πr²=32πr². Il rapporto è 1/2. Per γ uniforme costante diminuisce anche l’energia superficiale, senza perdere volume.

Leggi e calcolo manuale: R^3=8r^3;  R=2r;  A_i=32\pi r^2;  A_f=16\pi r^2;  \frac{A_f}{A_i}=\frac12

Risposta d’autore proposta: 1/2.

Distrattori e limiti: Due è il rapporto dei raggi, non delle aree totali. 1/8 usa il numero delle gocce senza ricostruire il raggio finale. 1/4 darebbe A_finale=8πr², incompatibile con R=2r. Otto non rappresenta una riduzione di superficie.

## C2-Q100 — Una bolla nel liquido non è un film di sapone

Versione 2, base 1; famiglia una-bolla-di-gas-nel-liquido; difficoltà 2.

Modello e passaggi: La parola bolla non basta a contare le superfici. Qui il gas tocca direttamente il liquido lungo una sola interfaccia sferica, quindi le due curvature principali uguali valgono 1/R e sommano 2/R. Il fattore quattro descriverebbe invece il diverso modello di una bolla di sapone a film sottile con due interfacce.

Leggi e calcolo manuale: \Delta p=\gamma\left(\frac1R+\frac1R\right);  \Delta p=\frac{2\gamma}{R}

Risposta d’autore proposta: Una sola interfaccia curva dà Δp=2γ/R.

Distrattori e limiti: Due curvature della stessa superficie non sono due interfacce fisiche. γR ha dimensione di forza, non pressione. La tensione non si annulla perché l’interno è gas e la curvatura dipende dal raggio.
