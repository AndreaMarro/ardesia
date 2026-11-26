# cric-c2-l007 — dieci problemi Cric distinti

Fonte Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, officina-di-fisica/content/C2.json, SHA7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23. Letti individualmente soltanto enunciati e metadati allowlist, insieme alle lezioni C2-L006–L010 e ai loro prerequisiti reali. Nessuna risposta, opzione, soluzione o figura originale usata per derivare le nuove risposte.

Primarie reciproche prima dei candidati: B sui cinquanta A001–050, commit9dc54dba, SHA34c7a33d1257ffa080cb94d8f36f0ebb753cf03134665b4b440153cc2f3a8237; A sui cinquanta B051–100, commit026127465e30476b3e8bdb874d9bd98520a0b8d2, SHAa51ecd2856370b38a67fd59f09b4dbce23eda319c27e5d379428b9fd67b1dc92. La primaria A è stata ricevuta soltanto come hash/percorso e non aperta durante l’autoria. Modello B per futura review A congelato in e37686eb, SHA02b2341e89122709fcddfb6a48318d3d87ded5385cbbfada9e69edaad05007dc, prima di aprire qualunque candidato A C2.

Sono dieci problemi differenti, non sedici variazioni di una famiglia artificiale. ID, corso, skill, famiglia, difficoltà, prerequisiti, ordine, flag exam e versione individuale originali conservati. Nuova version=baseVersion+1. Procedura manuale esatta, ipotesi fisiche e distrattori scritti per ciascun compito.

Unico assembler/importatore canonico; nessuna seconda ETL. Dipendenza esterna congelata {"commit": "23f3ff2bd9dfa5700f7e71acdd3a3d12c08fbab5", "path": "officina-di-fisica/tools/corpus_engineering/vector_geometry_authoring.py", "sha256": "0062a1e8b70ca767818105fcf1204e983fe2ef08b06fa379a2d68d26456dc22c"}. Il file helper è copiato byte-esatto per l’esecuzione e non attribuito a questa autoria.

Due assembly effettive identiche e import canonico entro il budget originale60 s: dieci salvati DRAFT, poi zero salvati/dieci invariati in SQLite temporaneo. I991 pubblicati e tutti i live head storici restano byte-invariati. Operazioni reali terminali0/null signal sotto mutex e guardia ≥2 GiB. Il PNG nativo completo è stato aperto e letto insieme all’XML: prova asset-only, non UI prodotto. Nessuna propria review scientifica, approvazione umana o pubblicazione: SCI/UI prodotto/human NOT_RUN, DRAFT.

## C2-Q061 — Che cosa suggerisce il tracciante

Versione 2, base 1; famiglia riconoscere-il-regime-da-un-tracciante; difficoltà 2.

Modello e passaggi: L’osservazione è compatibile con un moto laminare: gli strati conservano un’organizzazione ordinata nel tratto osservato. Questo non significa velocità uguale in ogni punto né viscosità nulla. Inoltre laminare e stazionario descrivono aspetti differenti: l’uno l’organizzazione spaziale, l’altro la dipendenza temporale del campo.

Leggi e calcolo manuale: \text{laminare: strati ordinati};  \text{stazionario: }\partial_t\vec v=0

Risposta d’autore proposta: Laminare.

Distrattori e limiti: Turbolento suggerirebbe fluttuazioni e mescolamento più marcati, non il filamento ordinato descritto. Un liquido viscoso può essere laminare e muoversi. La sola osservazione locale non dimostra che tutto il circuito sia nello stesso regime.

## C2-Q062 — Dalla sonda assiale alla media

Versione 3, base 2; famiglia velocita-media-dalla-sonda-assiale; difficoltà 2.

Modello e passaggi: La sonda legge il massimo del profilo parabolico, non una velocità uniforme. Integrando v_max[1−(r/R)²] sull’area circolare, la media è v_max/2. Dimezzo 56/100 e ottengo 28/100=7/25 m/s, cioè 0,28 m/s. La parete ferma non rende nulla la media del liquido.

Leggi e calcolo manuale: \bar v=\frac{1}{\pi R^2}\int_0^Rv(r)2\pi r\,\mathrm dr;  \bar v=\frac{v_{\max}}2;  \bar v=\frac7{25}\,\mathrm{m/s}

Risposta d’autore proposta: 0,28 m/s.

Distrattori e limiti: 0,56 m/s copia la lettura centrale; 1,12 la raddoppia invece di dimezzarla. 0,14 divide ancora per due senza ragione. Zero è il valore alla parete, non la media dell’intera sezione.

## C2-Q063 — Un gradiente richiede una distanza trasversale

Versione 2, base 1; famiglia misurare-un-gradiente-locale; difficoltà 2.

Modello e passaggi: Il gradiente confronta velocità in punti diversi, non tempi diversi. Converto 0,50 mm in 1/2000 m e 0,020 m/s in 1/50 m/s. Il rapporto è (1/50)/(1/2000)=40 s⁻¹. Il metro si cancella, lasciando l’inverso del tempo, non m/s².

Leggi e calcolo manuale: \Delta y=\frac1{2000}\,\mathrm m;  \Delta v_x=\frac1{50}\,\mathrm{m/s};  \left|\frac{\Delta v_x}{\Delta y}\right|=40\,\mathrm{s^{-1}}

Risposta d’autore proposta: 40 s⁻¹.

Distrattori e limiti: 0,04 s⁻¹ usa il coefficiente 0,50 come metri invece di millimetri. Un’accelerazione richiederebbe dividere per un tempo; qui il divisore è una lunghezza. Invertire il rapporto darebbe un tempo, non un gradiente di velocità.

## C2-Q064 — La viscosità dal rapporto fra sforzo e gradiente

Versione 2, base 1; famiglia risultato-di-un-viscosimetro-piano; difficoltà 2.

Modello e passaggi: La relazione costitutiva in modulo è τ=ηG, con G il gradiente. Divido lo sforzo per il gradiente positivo: (18/5)/12=3/10 Pa·s. Il pascal diviso per s⁻¹ dà Pa·s. Si ricava una proprietà del fluido nelle condizioni controllate, non una forza totale sulla parete.

Leggi e calcolo manuale: \eta=\frac{|\tau|}{G};  \eta=\frac{18/5}{12}\,\mathrm{Pa\,s};  \eta=\frac3{10}\,\mathrm{Pa\,s}

Risposta d’autore proposta: 0,30 Pa·s.

Distrattori e limiti: 43,2 moltiplica invece di dividere; 10/3 è il rapporto numerico inverso. Pa da solo misura lo sforzo, mentre η richiede anche il secondo. 3,6 copia il valore dello sforzo senza usare il gradiente.

## C2-Q065 — Stessa velocità fra strati adiacenti

Versione 2, base 1; famiglia scorrimento-uniforme-degli-strati; difficoltà 2.

Modello e passaggi: Il gradiente trasversale è zero, quindi il prodotto η ∂v_x/∂y è zero anche se la viscosità è positiva. La legge riguarda lo sforzo di taglio viscoso, non la pressione statica. Il fluido può traslare tutto insieme con velocità non nulla senza deformarsi localmente in questo modo.

Leggi e calcolo manuale: \partial_yv_x=0;  \tau_{xy}=\eta\,\partial_yv_x;  \tau_{xy}=0

Risposta d’autore proposta: Zero.

Distrattori e limiti: La pressione è uno sforzo normale distinto dal taglio. Non si deduce η=0 da un prodotto nullo se il gradiente è già zero. Un massimo di taglio richiederebbe differenze di velocità, non uguaglianza.

## C2-Q066 — La condizione sulla parete ferma

Versione 2, base 1; famiglia il-valore-sulla-parete; difficoltà 1.

Modello e passaggi: L’aderenza impone che la velocità del liquido al contatto coincida con quella della superficie. Poiché il riferimento è quello della parete ferma, entrambe valgono zero. Non significa che siano nulle anche le velocità lontane dalla parete, né il gradiente vicino a essa.

Leggi e calcolo manuale: \vec v_{\rm liquido,parete}=\vec v_{\rm parete};  \vec v_{\rm parete}=0;  \vec v_{\rm liquido,parete}=0

Risposta d’autore proposta: Nulla.

Distrattori e limiti: Il massimo e la media appartengono ad altri punti o all’intera sezione. Una velocità opposta non soddisferebbe l’aderenza. La condizione assegnata elimina l’indeterminazione del valore al contatto.

## C2-Q067 — Il massimo della velocità non è quello del gradiente

Versione 2, base 1; famiglia dove-e-maggiore-il-taglio; difficoltà 2.

Modello e passaggi: Derivo rispetto alla coordinata radiale: dv/dr=−2v_max r/R². Il suo modulo cresce linearmente con r, da zero sull’asse fino al massimo alla parete. La velocità invece è massima sull’asse e nulla alla parete: valore del campo e sua pendenza sono grandezze diverse.

Leggi e calcolo manuale: \frac{\mathrm dv}{\mathrm dr}=-\frac{2v_{\max}r}{R^2};  \left|\frac{\mathrm dv}{\mathrm dr}\right|=\frac{2v_{\max}r}{R^2};  \max |\mathrm dv/\mathrm dr|=\frac{2v_{\max}}R

Risposta d’autore proposta: Alla parete, r=R.

Distrattori e limiti: L’asse dà il massimo di v ma gradiente zero per simmetria. Un gradiente uniforme sarebbe un profilo lineare, non parabolico. Il dominio termina a R: non serve estendere la legge fuori dal liquido.

## C2-Q068 — Un punto a quattro quinti del raggio

Versione 2, base 1; famiglia un-valore-intermedio-nel-profilo; difficoltà 2.

Modello e passaggi: La frazione radiale è 4/5. La elevo al quadrato, ottenendo 16/25, e la sottraggo da uno: 9/25. Il valore è compreso fra zero e uno, come richiede un punto interno a velocità concorde con l’asse del tubo. Non è la media d’area del profilo.

Leggi e calcolo manuale: \frac rR=\frac45;  \left(\frac rR\right)^2=\frac{16}{25};  \frac{v(r)}{v_{\max}}=1-\frac{16}{25};  \frac{v(r)}{v_{\max}}=\frac9{25}

Risposta d’autore proposta: 9/25.

Distrattori e limiti: 4/5 copia la posizione normalizzata; 1/5 omette il quadrato e calcola 1−4/5. 16/25 è il termine da sottrarre, non la velocità. 1/2 è la media del profilo, non questo valore locale.

## C2-Q069 — Una risposta non proporzionale al gradiente

Versione 2, base 1; famiglia un-fluido-a-viscosita-dipendente-dal-gradiente; difficoltà 3.

Modello e passaggi: Una viscosità costante darebbe τ_B/τ_A=G_B/G_A=2. Il fattore osservato 13/10 è diverso. Il rapporto fra viscosità apparenti sarebbe (13/10)/2=13/20: il comportamento nel campo di prova non è descritto dallo stesso coefficiente costante. Questa conclusione non identifica da sola un materiale o un’applicazione clinica.

Leggi e calcolo manuale: \frac{\tau_B}{\tau_A}=\frac{\eta_B}{\eta_A}\frac{G_B}{G_A};  \frac{\eta_B}{\eta_A}=\frac{13/10}{2};  \frac{\eta_B}{\eta_A}=\frac{13}{20}

Risposta d’autore proposta: Viscosità newtoniana costante nel campo di prova.

Distrattori e limiti: La non proporzionalità non modifica le definizioni di unità né elimina il campo di velocità. La conservazione della massa riguarda un bilancio diverso. Concludere quiete contraddirebbe il gradiente non nullo assegnato.

## C2-Q070 — Allontanare due piastre

Versione 2, base 1; famiglia dilatare-lo-spazio-fra-piastre; difficoltà 2.

Modello e passaggi: Il profilo lineare dà G=U/d. Il modulo della forza che mantiene il moto è F=ηAU/d, opposto alla resistenza viscosa sulla piastra mobile. Nei due stati η,A,U si cancellano: resta d_A/d_B=1/(5/2)=2/5. Distanze nella stessa unità si possono dividere senza conversione aggiuntiva.

Leggi e calcolo manuale: F=\eta A\frac Ud;  \frac{F_B}{F_A}=\frac{d_A}{d_B};  \frac{F_B}{F_A}=\frac25

Risposta d’autore proposta: 2/5.

Distrattori e limiti: 5/2 tratta la forza come direttamente proporzionale alla distanza. 25/4 eleva al quadrato quel rapporto senza una legge che lo richieda. Uno ignora il gradiente ridotto; 1/5 non ricostruisce il rapporto fra 1 e 2,5.
