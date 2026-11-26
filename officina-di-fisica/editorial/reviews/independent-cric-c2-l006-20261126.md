# Revisione distinta cric-c2-l006

Dieci problemi originali distinti. Primaria e modello pre-key congelati prima delle chiavi; nessun modulo autore B o primaria opposta aperti. Edizione finale confrontata byte per byte con Git. Lettura individuale completa; figura nuova controllata in XML e in un PNG indipendente intero.

Verdetti AI degli oracoli: 10/10. Il target comune effettivo è 19/19; non è una prova UI del prodotto né un’approvazione umana. Integrazione canonica Root ancora da eseguire.

## C2-Q051

Ipotesi e dominio: Liquido ideale incomprimibile, corrente non nulla stazionaria orizzontale senza rami; stessa linea, niente macchine/perdite e pressione sufficiente a non cambiare fase.

Calcolo e controllo manuale: Continuità stazionaria incomprimibile senza rami: Q=A v è comune. Per portata non nulla, una sezione minore richiede rapidità maggiore. Bernoulli lungo la stessa linea di corrente orizzontale, senza perdite o macchine, dà p+ρv²/2 costante: alla maggiore rapidità corrisponde pressione statica minore. Non è una perdita di portata; pressione e rapidità sono grandezze diverse.

Confronto delle risposte errate: Q comune e area minore impongono velocità maggiore. Una pressione crescente richiederebbe energia aggiunta; stazionario non significa campo uniforme.

Verifica: AI_CONCEPTUAL; firma `98179fff27b8821f69e9548da87ff5bedf84c3b62d9e4c2e6d0e56b753eb3e9f`.

## C2-Q052

Ipotesi e dominio: Stessa quota, densità 1000 kg/m³, velocità 2 → 1 m/s; profili uniformi, bilancio ideale e differenza finale meno iniziale.

Calcolo e controllo manuale: Bernoulli orizzontale: p_f−p_i=(ρ/2)(v_i²−v_f²). Inserisco 1000/2=500 kg/m³ e 2²−1²=3 m²/s²: incremento +1500 Pa. La decelerazione recupera pressione nel modello ideale. Un valore negativo scambierebbe finale e iniziale; non si usa il quadrato della differenza 2−1.

Confronto delle risposte errate: −1500 inverte i punti;500 nasce da 500·(2−1)², mentre 3000 omette il mezzo. 4−1 e(2−1)² sono diversi.

Verifica: EXACT_ORACLE; firma `53d79cf56cb409d0cb2d5039fbf073dbcd73207908639c608b59659757075c05`.

## C2-Q053

Ipotesi e dominio: Salita verticale 3/4 m, densità 800 kg/m³ e g 10; velocità uguali, niente lavoro d’albero/perdite, si chiede il modulo della diminuzione.

Calcolo e controllo manuale: Sezione costante e incomprimibilità mantengono la stessa rapidità nei due stati. Rimangono p+ρgz costanti: p_f−p_i=−ρg Δz=−800·10·(3/4)=−6000 Pa. Si chiede di quanto diminuisca, quindi il modulo della caduta è 6000 Pa. Il dislivello è verticale, non la lunghezza del tubo.

Confronto delle risposte errate: Velocità uguali non eliminano ρg Δz. Senza g si ottengono 600, con Δz 1 si ottengono 8000; il modulo richiesto è 6000 e Δp orientata è−6000.

Verifica: EXACT_ORACLE; firma `d5e8e1ac65bde19049fe9fbec4a8ff57fc0801a8fc40ab125d80225a61a708dc`.

## C2-Q054

Ipotesi e dominio: Ristagno nel riferimento dell’ostacolo, stessa quota e linea di corrente, aria nel modello incomprimibile con ρ 6/5; differenza positiva 60 Pa e radice di rapidità positiva.

Calcolo e controllo manuale: Nel punto di ristagno v=0 e la differenza rispetto alla pressione statica è ρv²/2. Quindi v²=2·60/(6/5)=100 m²/s² e la rapidità è la radice positiva 10 m/s. Si usa il modello di aria incomprimibile prescritto; non serve una radice decimale né si identifica la pressione totale con quella statica.

Confronto delle risposte errate: 100 ha dimensione di rapidità al quadrato. Omettere 2 produce√50, non 10. Il ramo negativo non rappresenta una rapidità.

Verifica: EXACT_ORACLE; firma `33db2bd6cb903e98c1eba738a2c64e7d98612dff6d1635f0db409c85847d20ca`.

## C2-Q055

Ipotesi e dominio: Tubo orizzontale uniforme a pareti ferme, fluido viscoso e stato stazionario; stessa velocità media e pressione decrescente richiedono dissipazione.

Calcolo e controllo manuale: Con uguali quota e velocità media, il calo di pressione non si spiega col Bernoulli ideale senza perdite. Occorre la dissipazione viscosa dell’energia meccanica, che alimenta energia interna e scambi termici. In un tubo uniforme stazionario la portata può restare costante benché la pressione diminuisca. Il calo positivo pertinente entra come perdita di carico o potenza dissipata Δp·Q.

Confronto delle risposte errate: Non cambiano quota o velocità media; un calo di pressione non è creazione di energia né assenza di lavoro delle pressioni.

Verifica: AI_CONCEPTUAL; firma `da3b10364cf07bfd48312f631bee8aaf51e93a4549d3908cc66e4af086f0008d`.

## C2-Q056

Ipotesi e dominio: Profili uniformi, liquido ideale e pressione a valle inferiore 1500 Pa, v₁ 1 m/s e ρ 1000; prima Bernoulli, poi continuità.

Calcolo e controllo manuale: Da p_1−p_2=(ρ/2)(v_2²−v_1²), 1500=500(v_2²−1) con le unità SI coerenti. Risulta v_2²=4 m²/s² e, nello stesso verso di flusso, v_2=2 m/s. Continuità dà A_1/A_2=v_2/v_1=2. Il rapporto delle aree è inverso a quello delle rapidità nelle sezioni corrispondenti.

Confronto delle risposte errate: Quattro è v₂²/v₁²;1/2 è A₂/A₁. Con v₂ 2 e v₁ 1, il rapporto delle aree è 2 e non 4.

Verifica: EXACT_ORACLE; firma `11c74ad0e96bb5867fbca18f5eb07fc9502f76bfb18755014ee85604205753c3`.

## C2-Q057

Ipotesi e dominio: Arresto locale rispetto a ostacolo fermo; non si assume fermo il campo intero. Nome del punto distinto da fase o densità.

Calcolo e controllo manuale: Il sostantivo richiesto è ristagno. Il punto di ristagno ha velocità locale nulla rispetto all’ostacolo fermo e permette il confronto fra pressione totale e statica nel modello ideale. Non significa che tutta la corrente sia ferma. Nessuna opzione o alias originale è stato aperto.

Confronto delle risposte errate: Il nome non descrive ebollizione o densità nulla. La pressione di ristagno non è il minimo della corrente ideale alla stessa quota.

Verifica: AI_CONCEPTUAL; firma `65ecc9f5902e97680ed5be932b872ed0f86bd2e5cab9931eae240b29933f3d40`.

## C2-Q058

Ipotesi e dominio: Confronto reale/ideale alla stessa situazione geometrica; separazione e mescolamento dissipano energia meccanica senza violare energia totale e senza diagnosi clinica.

Calcolo e controllo manuale: Un allargamento brusco reale può separare la corrente e creare ricircolo, mescolamento e dissipazione viscosa. La pressione recuperata è la diminuzione del termine cinetico meno la perdita meccanica positiva: p_2−p_1=ρ(v_1²−v_2²)/2−Δp_perdita. Non è necessario dichiarare ogni ricircolo automaticamente turbolento; è la perdita non nulla a rendere insufficiente la stima ideale.

Confronto delle risposte errate: Perdita meccanica non significa perdita di energia totale; non implica gravità invertita, densità nulla o pressione sempre costante.

Verifica: AI_CONCEPTUAL; firma `4b20152e12af586539cb55a62dabbcc648cdfd448ba0efcf8f04409631b8b6db`.

## C2-Q059

Ipotesi e dominio: Due stati istantanei distinti di grande serbatoio aperto, piccolo foro, velocità superficiale trascurabile e stessa atmosfera ai due estremi; nessuna previsione di livello costante nel tempo.

Calcolo e controllo manuale: Nel modello di Torricelli istantaneo, serbatoio grande, superficie e getto alla stessa pressione esterna e perdite assenti, v=√(2 gh). Quadruplicare h moltiplica v per √4=2: da 2 a 4 m/s. Non quadruplica la rapidità; il confronto è fra due battenti preparati, senza bisogno di integrare lo svuotamento.

Confronto delle risposte errate: h×4 implica v×2;8 m/s userebbe una legge lineare.2 ignorerebbe il battente e 1 invertirebbe il fattore 2.

Verifica: EXACT_ORACLE; firma `8e56bf50ee19eb3bf4b57a149634e580b9c1626963db383c7e39e40cfc9b8399`.

## C2-Q060

Ipotesi e dominio: Bernoulli ideale stazionario incomprimibile alla stessa quota; orientazione p₁−p₂ fissata. Differenza delle energie, non energia della variazione.

Calcolo e controllo manuale: Il bilancio corretto è p_1−p_2=ρ(v_2²−v_1²)/2, cioè differenza dei quadrati, non quadrato della differenza. L’espressione proposta aggiunge un termine incrociato e non può dare una differenza negativa durante una dilatazione. Per esempio v_1=1 e v_2=2 darebbero rispettivamente 3 e 1 come fattori cinematici; è una controprova indipendente, non un’opzione vista.

Confronto delle risposte errate: Lo scambio dei punti cambia il segno della differenza corretta. Il quadrato della somma non si annulla per velocità uguali; quello della differenza perde il cambio di segno.

Verifica: EXACT_ORACLE; firma `340c7afa8ccb9b5165469b23f77737aca994a80851b825212569ab8466c6a123`.
