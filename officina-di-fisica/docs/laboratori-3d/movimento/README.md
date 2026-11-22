# Cinque esperimenti animati nell’Officina

Nel menu **Simulazioni 3D** apri **I cinque esperimenti animati**, subito sotto la ricerca. Scegli un banco, formula una previsione e premi **Confronta con il banco**. In **Osserva** puoi fermare il fenomeno. **Regola il tempo** permette di digitare un istante in secondi, avanzare dell’1% del ciclo, rallentare o ripetere l’esperimento. I collegamenti all’app aprono l’anteprima locale sul Mac. In modalità verifica, il pulsante **Apri un quaderno di prova** dà accesso ai corsi riservati. [Catalogo](http://127.0.0.1:8847/#laboratori) · [Schermata del punto di accesso](catalogo.jpg)

| Corso | Prova nel banco | Cosa osservare | Registrazione dell’app |
| --- | --- | --- | --- |
| C1 | [Moto parabolico](http://127.0.0.1:8847/#banco/LAB3D-02) | Al culmine la componente verticale della velocità si annulla. La pallina continua a muoversi in orizzontale e la gravità resta diretta verso il basso. | [Guarda il lancio](C1.mp4) |
| C2 | [Poiseuille nel capillare](http://127.0.0.1:8847/#banco/LAB3D-04) | Metti la sonda a metà raggio e confronta il suo tracciante con quello in asse. Prova a raddoppiare il raggio nelle due modalità della pompa. | [Guarda i traccianti](C2.mp4) |
| C3 | [Gas ideale e pistone](http://127.0.0.1:8847/#banco/LAB3D-05) | Durante la compressione il pistone scende, il punto sull’isoterma si sposta verso pressioni maggiori e il lavoro compiuto dal gas è negativo. | [Guarda il pistone](C3.mp4) |
| C4 | [Forza elettromotrice indotta](http://127.0.0.1:8847/#banco/SIM-C4-L10-02) | Ferma il banco quando il campo attraversa lo zero. La pendenza del flusso dà ancora una fem. Apri l’interruttore e confronta fem e corrente. | [Guarda l’induzione](C4.mp4) |
| C5 | [Interferenza di due sorgenti](http://127.0.0.1:8847/#banco/LAB3D-10) | Dall’alto segui le creste. In sezione leggi la somma nel punto P. Sulla mediana, portare la fase da 0° a 180° trasforma un massimo in un nodo. | [Guarda le onde](C5.mp4) |

## Interfaccia e svolgimenti

La sequenza **Prevedi → Osserva → Esplora → Comprendi → Verifica** accompagna le 181 simulazioni delle voci di lezione, i dieci banchi di approfondimento e i cinque laboratori guidati. Sul desktop la scena affianca l’obiettivo corrente e i grafici. Sul telefono la didascalia è sotto la scena. I parametri si aprono in un pannello e **Ruota col dito** attiva la rotazione e il gesto di zoom. **Concentrazione** ingrandisce lo strumento e **Ripristina vista** recupera l’inquadratura. La preferenza di movimento ridotto lascia allo studente la scelta di avviare l’animazione.

Il confronto mostra lo stesso banco del pistone nella fase dedicata all’esplorazione. Le immagini iniziali provengono dal codice della PR prima dell’intervento. Nelle immagini finali l’orologio è fermo a 3,78 s, con volume di 2,055 L. [Versione iniziale](https://github.com/AndreaMarro/ardesia/commit/0bcbf646e372cb8674d9f2189828ae3ff2a6180b) · [Codice dei due interventi](https://github.com/AndreaMarro/ardesia/commit/0c63a5b43a65aef4eb52d903832907cad6e2562c)

| Schermo | Prima | Dopo | Ispezione degli undici fenomeni |
| --- | --- | --- | --- |
| Desktop 1440 × 960 | [Prima](prima-desktop.jpg) | [Dopo](dopo-desktop.jpg) | [11 schermate](undici-desktop.webp) |
| Tablet 810 × 1080 | [Prima](prima-tablet.jpg) | [Dopo](dopo-tablet.jpg) | [11 schermate](undici-tablet.webp) |
| Smartphone 390 × 844 | [Prima](prima-mobile.jpg) | [Dopo](dopo-mobile.jpg) · [Affiancate](confronto-mobile.webp) | [11 schermate](undici-mobile.webp) · [11 tavole senza WebGL](undici-tavola.webp) |

Ogni pilota contiene **quattro disegni progressivi**. Lo studente decide quando passare al successivo. In C1, per esempio, segue le componenti sul piano, legge la velocità verticale, somma l’area con segno e infine ritrova il tempo di volo. In C4 passa da una spira alle dieci spire, misura la pendenza del flusso e chiude il circuito. Il disegno, la lettura evidenziata e l’equazione usano l’istante selezionato. Le cinque esperienze aggiungono **20 disegni, cinque esercizi di verifica e cinque problemi di trasferimento**. Restano accessibili i 362 problemi delle voci e i 20 dei banchi estesi. [I venti disegni ripresi dal browser](venti-disegni.webp)

## Modelli e controlli scientifici

- **C1.** Lancio alla quota di arrivo, aria trascurata e accelerazione verticale di −9,81 m/s². Il controllo deriva numericamente le coordinate e la velocità, verifica l’energia per unità di massa e cerca le radici della quota anche per un lancio verticale. [OpenStax, Projectile Motion](https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion)
- **C2.** Il profilo laminare sviluppato è v(r) = 2v̄[1 − (r/R)²]. L’integrale numerico delle velocità sugli anelli della sezione restituisce la portata. La derivata dello spostamento di un tracciante restituisce la velocità locale. Raddoppiando R, la portata si moltiplica per 16 a pressione imposta e la caduta di pressione si divide per 16 a portata imposta. Da Re = 2300 il banco sospende profilo e traccianti e segnala il limite del modello. [OpenStax, Viscosity and Turbulence](https://openstax.org/books/university-physics-volume-1/pages/14-7-viscosity-and-turbulence)
- **C3.** Gas ideale, sezione costante, trasformazione isoterma attraverso stati di equilibrio. Il comando varia il volume linearmente in 6 s. La pressione segue p = nRT/V. Il lavoro del gas è nRT ln(V/Vᵢ). La quadratura numerica indipendente di p dV conferma modulo e segno in espansione, compressione e a volume invariato. [OpenStax, Work, Heat, and Internal Energy](https://openstax.org/books/university-physics-volume-2/pages/3-2-work-heat-and-internal-energy)
- **C4.** Bobina ferma di 10 spire, ognuna di 0,05 m², campo uniforme normale alla spira. La fem è l’opposto della derivata del flusso concatenato. La misura numerica usa due istanti vicini e controlla anche il passaggio per campo nullo. Nel circuito aperto I = 0. Nel circuito chiuso ideale con carico puramente resistivo I = ε/(5 Ω). [OpenStax, Faraday’s Law](https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law)
- **C5.** Due sorgenti coerenti con ampiezza di 2 mm ciascuna. I fronti sono circolari e l’ampiezza dei singoli contributi si assume costante nella zona osservata. Il test confronta la somma puntuale e il massimo su un periodo, verifica l’avanzamento di una cresta e costruisce nodi sia con la fase sia con la differenza di cammino. [OpenStax, Interference of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves)

Lo stesso tempo simulato alimenta modello, geometria, tavola 2D, grafici e letture. Un test ripete lo stesso intervallo a 24, 60 e 120 fotogrammi/s. Nel browser la camera resta ferma mentre il test confronta due istanti al 14% e al 63% del ciclo. In ciascuno dei 30 casi dei piloti la scena cambia e il cursore del grafico raggiunge l’ascissa prevista. Le clip mostrano 5,8 s di riproduzione effettiva ciascuna. [Prove numeriche](../../../tests/movimento.test.js) · [Controlli nel browser](../../../tests/browser-movimento.mjs)

## Collaudo e prestazioni

| Verifica | Risultato |
| --- | --- |
| Modelli, contenuti e server | 227 test JavaScript e 22 test Python superati. Validati 991 record e 747 formule, con zero errori di formula. |
| Esperimenti di lezione | 181 ID distinti per ciascuna delle quattro configurazioni, 724 percorsi completi. Per ogni voce si apre il collegamento dal suo paragrafo, si confrontano le letture e si risolvono entrambi i problemi. Il ritorno alla lezione conserva il passaggio aperto. [Letture di tutte le 181 voci nei quattro profili](voci-verificate.csv) |
| Distribuzione delle voci | C1 42, C2 41, C3 36, C4 29, C5 27, C6 6. Il catalogo del percorso completo include anche le voci dei cinque microcorsi. |
| Nuova interfaccia | 11 fenomeni × 3 schermi × 2 renderer, 66 casi. Verificati anche la tastiera in concentrazione, la sospensione a pagina nascosta, la pausa, il reset e la corrispondenza fra istante e grafico. |
| Banchi estesi | 30 aperture WebGL, 10 tavole alternative, 20 problemi precedenti. Verificato che ogni banco carichi soltanto il proprio modello. Verificati il gesto di zoom touch, il rilascio dei contesti e il ritorno dalla lezione o dal quesito in corso. |
| Regressioni dell’app | Superati navigazione C6, esempi guidati, simulazione d’esame, errori e recupero, ripresa su un secondo client, cinque laboratori guidati, PDF e accesso autore. La prova dell’editor comprende bozze, ripristino delle versioni, pubblicazione e visualizzazione mobile. |

Le misure provengono da Chrome 157 su Mac Apple M1, 8 GB, scala del dispositivo 1. Il tempo va dal cambio di pagina al primo disegno. La mediana usa i cinque piloti nella sessione locale. La cadenza conta i disegni effettivi durante una finestra di circa 0,66 s. Il testo e le tavole SVG si aggiornano ogni 80 ms circa mentre l’orologio conserva i secondi simulati. [Misure individuali dei 66 casi](misure.csv)

| Profilo | Primo disegno 3D, mediana | Disegni 3D/s, minimo–massimo | Prima tavola 2D, mediana | Aggiornamenti 2D/s |
| --- | --- | --- | --- | --- |
| Desktop | 96 ms | 59–60,5 | 32 ms | 12,1 |
| Tablet | 74 ms | 60,4–60,5 | 31 ms | 12,1 |
| Smartphone | 107 ms | 60,4–60,5 | 44 ms | 12,1 |

Tablet e smartphone sono profili touch emulati. Restano da misurare fluidità e consumi su dispositivi fisici e da osservare la comprensione con studenti in aula. La prova visiva ha incluso confronto prima/dopo, lettura delle didascalie sui tre formati e controllo delle registrazioni a camera ferma.

Sul commit applicativo il controllo GitHub dell’Officina e quello sul contratto della PR sono verdi. Quattro job generali del repository si arrestano durante l’installazione di Chromium. Playwright 1.60.0 segnala che il runner Ubuntu 26.04 non è supportato. [CI generale](https://github.com/AndreaMarro/ardesia/actions/runs/45025799545) · [Marketing](https://github.com/AndreaMarro/ardesia/actions/runs/45025799561) · [Controllo didattico dell’Officina](https://github.com/AndreaMarro/ardesia/actions/runs/45025799529)

Il collaudo si può ripetere dalla cartella dell’app con le dipendenze di sviluppo del progetto.

```sh
node --test tests/*.test.js
python3 -m unittest discover -s tests
node tests/browser.mjs
node tests/editor.mjs
node tests/browser-banchi.mjs
node tests/browser-esperienze.mjs
ASTRA_SHOTS=var/collaudo-moto node tests/browser-movimento.mjs
```

Per registrare le cinque esperienze da un server locale in modalità verifica, eseguire `node tools/registra-movimento.mjs http://127.0.0.1:8847/ var/clip`. Il registratore usa una sessione di prova separata e richiede Chrome e FFmpeg.

## Proposta per una futura iterazione

Per ogni voce partire dalla domanda che lo studente deve saper risolvere. Se richiede una previsione nel tempo, definire condizioni iniziali, dominio e unità, poi una funzione della forma `sample(stato, t)` condivisa da scena, diagramma e grafico. Se riguarda una relazione spaziale, come la costruzione dell’immagine di una lente, descrivere invece l’ordine dei raggi e delle misure che lo studente deve costruire. Ogni proposta dovrebbe indicare due condizioni di confronto e un caso limite verificabile.

Dopo la valutazione dei cinque piloti, il successivo lotto si potrà scegliere insieme in base alla difficoltà didattica e provare su un telefono fisico. Per ciascuna voce il criterio di accettazione sarebbe spiegare un caso nuovo usando ciò che si è osservato.
