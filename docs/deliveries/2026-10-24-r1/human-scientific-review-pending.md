# Scheda scientifica/editoriale umana — PENDING

Questa scheda riguarda i contenuti esatti del candidato R1 indicato sotto. Raccoglie oracoli automatizzati e punti da leggere/ascoltare dal docente; non registra una firma umana né autorizza la pubblicazione.

| Binding finale | Identità |
| --- | --- |
| Codice prodotto | `91219486ddf270582bef1c2e0bda2a66796e6e78` |
| Manifest proiezione pubblica,20 asset | `a785a4a0dc151c2d859066f9f1016fdce501352a40778efca019ca212dacde5a` |
| Manifest fonte,1596 file | `71c85b055e63c7cc2ef5deb5c18181efe45e2e4959400356b6dfda9f69ace435` |
| Inventario sourceTreeSha256 | `8211844a37af1894dc104955f7389473e7556544f3980469d55be3c24f5a2d4b` |
| Manifest completo QA locale,758 asset | `3251cb61eb10e4513cafceb1e6b8698a92e03ba48ede383f89a1f20581d3ed58` |

Reviewer scientifico umano: `null` · Autorizzatore editoriale umano: `null` · Decisione: `PENDING` · Riferimento decisione: `null` · Data approvazione: `null`.

Il checker della sola proiezione pubblica è TechnicalPASS/releaseBLOCKED; il completo QA locale resta TechnicalFAIL per il pattern client Firebase upstream già dichiarato. Non distribuire il completo come pacchetto marketing. Le firme sotto non si deducono da un hash o da un test.

## Modello, unità e ipotesi da confermare

Q = π r⁴ Δp / (8 η L). Q è in m³/s; r e L in m; Δp in Pa; η è viscosità dinamica in Pa·s. I parametri Core `radiusRatio`, `viscosity` e `length` sono rapporti r/r₀, η/η₀ e L/L₀, non valori SI assoluti. La grandezza calcolata è Q/Q₀ con Δp fissata oppure Δp/Δp₀ con Q fissata.

Dominio dichiarato prima della soluzione: fluido newtoniano incomprimibile; moto laminare stazionario e completamente sviluppato; tubo cilindrico circolare uniforme, rigido e orizzontale; aderenza/no-slip alla parete. L'orizzontalità trascura la variazione gravitazionale lungo il tubo. Il regime laminare deve essere verificato con valori assoluti; i soli rapporti non determinano Reynolds. Modello idealizzato, nessuna previsione clinica.

La scena mostra il trasporto medio Q = v_media A. Non risolve un profilo locale o una simulazione CFD completa. Il numero dei punti non misura la portata. Nella nuova prova pubblica A la lunghezza è davvero disegnata doppia e i valori mostrano Q1, Δp4 e v1; il grafico che assume η=L=1 rimane nascosto.

## Oracoli SI indipendenti

Riferimento costruito fuori dal Core: r₀=1mm=0,001m; L₀=200mm=0,2m; η₀=1mPa·s=0,001Pa·s; Δp₀=10Pa. Fluido ipotetico con densità1000kg/m³, non proprietà cliniche o misure. Q₀≈1,96349540849362×10⁻⁸m³/s=19,6349540849362µL/s; v₀=0,00625m/s; Re₀=12,5.

| Caso | Vincolo | Risposta attesa |
| --- | --- | --- |
| r2; η,L invariati | Δp fissata | Q/Q₀=16 |
| r2; η,L invariati | Q fissata | Δp/Δp₀=1/16=0,0625 |
| r0,5; η,L invariati | Q fissata | Δp/Δp₀=16 |
| η2; r,L invariati | Δp fissata | Q/Q₀=1/2 |
| L2; r,η invariati | Δp fissata | Q/Q₀=1/2 |
| η2,L3; r invariato | Q fissata | Δp/Δp₀=6 |

`scientific-final-oracle.json` conserva144 casi SI indipendenti, i sei casi sopra, quadratura del profilo parabolico, controllo dimensionale Q=L³/T e27 invalidi. Nessuna funzione Ardesia è usata come oracolo di un'altra funzione Ardesia. Gli stessi file scientifici sono byte identici nel codice finale9121948. `public-final-projection-oracle.json` ricontrolla i62 casi ordinari pubblici e Q/A. Il caso estremo non finito emerso dalla review ora viene respinto con invalid_physical_domain.

## Due varianti v2 da approvare esattamente

Manifest `learning-experiences-v2.json`, SHA `c3392e0cb62a45ad66d59bb2046a756fbc99f0ddee0f32a55a6333f06da2bc01`. Le due composizioni sono DRAFT, non una banca approvata.

| Variante / case ID | Parametri | Risposta attesa | Q/Q₀; Δp/Δp₀; v/v₀ |
| --- | --- | --- | --- |
| poiseuille-boundary-v2 / fixed-pressure — RF-06 | r2, Δp fissata | Q16 |16;1;4 |
| poiseuille-boundary-v2 / fixed-flow — inline | r2, Q fissata | Δp0,0625 |1;0,0625;0,25 |
| poiseuille-boundary-v2 / transfer — inline | r1,η2,L2,Q fissata | Δp4 |1;4;1 |
| poiseuille-nearby-v2 / fixed-pressure — RF-02 | r1,2, Δp fissata | Q2,0736 |2,0736;1;1,44 |
| poiseuille-nearby-v2 / fixed-flow — RF-03 | r1,25, Q fissata | Δp0,4096 |1;0,4096;0,64 |
| poiseuille-nearby-v2 / transfer — inline | r1,η2,L0,5,Δp fissata | Q1 |1;1;1 |

A richiede di comporre gli effetti di viscosità e lunghezza: a r,Q fissi Δp è proporzionale a ηL, quindi2×2=4. B usa compensazione: a r,Δp fissi Q è inversamente proporzionale a ηL, quindi2×0,5=1. I transfer modificano il ragionamento sui parametri e non soltanto il numero del raggio. Correttezza del procedimento e qualità didattica vanno comunque giudicate dal docente; non si deduce apprendimento da questi sei esiti.

CoursePack `relazioni-fluidi-v1@1`: SHA canonico `3e0589e3647cc8d45e006c58839f2b83b06a13451f5d2985ac01eee8efaa321f`, file grezzo `5cb12ea9ab8dd8b367f7ef71e10c7ab7e3e254e8d1ef684bcf3da7a8c343a3b4`. Pack e manifest v1 non sono stati modificati; i vecchi ID e le ricevute restano risolvibili. La revisione qui riguarda i contenuti elencati, non l'approvazione dell'intera banca4000 DRAFT.

## Previsione, aiuti e nuova prova

La previsione numerica precede il risultato. Dopo l'errore il recupero indica il vincolo, la formula e l'effetto dei rapporti, senza sostituire il docente. La nuova prova A varia η e L mantenendo Q e r; la variante B usa la compensazione a Δp fissata.

L'aiuto e un risultato già disponibile sul medesimo modello/versione/parametri restano evidenze anche passando da v1 a v2; actor ed edizione diversi rimangono isolati. Nove controprove su SQLite reale includono due connessioni concorrenti e producono esattamente una prima risposta e una risposta con risultato precedente disponibile. Postgres remoto NOT_RUN. NO_SUPPORT_REQUESTED indica assenza di supporto richiesto/osservato nella scope dichiarata: non esclude aiuti esterni e non equivale a padronanza o apprendimento misurato.

## Audio esatto da ascoltare

Trascrizione originale finale:

> Prima scegli che cosa resta costante. A differenza di pressione fissata, se il raggio raddoppia la portata diventa sedici volte maggiore. A portata fissata, invece, la differenza di pressione necessaria si riduce a un sedicesimo. Non cambia la legge: cambia il vincolo. Ora mantieni la portata e il raggio, ma raddoppia viscosità e lunghezza.

Transcript JSON SHA `3fa466d4e394549e0e9dd8dd1e11bdf18105429f0a50710907429dce8c82f3b4`. Generatore SHA `9ccb48391771494db60d067981a8354769682ae20cba022b0d921fc25b3e7836`, eSpeak formante0.3.5/rate0,95. WAV SHA `530c78a6075ea26949265a80fe9efc7d23083cf638cb600ec52fb42ddc873989`,1.882.900byte,22050Hz mono16bit,42,695s. La rigenerazione esterna dallo script invariato produce gli stessi byte; il vecchio WAV sperimentale con rate diverso è escluso. Il browser riproduce l'audio sotto CSP e reset ne interrompe la riproduzione.

Questa prova lega input e sintesi deterministica, non è ASR o ascolto umano. Pronuncia di simboli/frazioni, ritmo, chiarezza dell'ultima istruzione e accessibilità della trascrizione restano da ascoltare e approvare dal docente.

## Punti di firma umana

| Punto | Stato |
| --- | --- |
| Legge, grandezze, conversioni, ipotesi e limiti | PENDING |
| Due varianti v2, sei soluzioni e ragionamento dei transfer | PENDING |
| Previsione prima dell'esito e aiuti pertinenti | PENDING |
| Ascolto del WAV esatto, pronuncia, ritmo e trascrizione | PENDING |
| Claim, ruolo del tutor e leggibilità del candidato pubblico esatto | PENDING |
| Quattro esempi marketing DRAFT: approvazione dei digest o esclusione con rebuild | PENDING |
| Target e autorizzazione di pubblicazione | PENDING |

Il contatto resta manifestazione d'interesse, non iscrizione, pagamento, invito o accesso. Nessun voto o efficacia clinica/didattica misurata è dichiarato. Qualsiasi edit a questi contenuti invalida il relativo binding e richiede nuova verifica. TechnicalPASS locale e configurazione Vercel non costituiscono firma, hosting reale o autorizzazione.

Fonti primarie consultate per formula/unità e dominio: [OpenStax, College Physics12.4](https://openstax.org/books/college-physics/pages/12-4-viscosity-and-laminar-flow-poiseuilles-law), [University of Virginia Physics Lab](https://galileo.phys.virginia.edu/classes/241L/poise/poise.htm). Nessun esempio clinico è stato copiato.
