"""Assemble the C5 field, spectrum and photon draft editions and the nuclei and optics drafts from immutable sources.

Use the canonical astra/1 importer for persistence. This authoring script confers
no scientific acceptance and writes no central ledger entries.
"""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c5-field-spectrum-photon-reading-20261127'
NUCLEI_OPTICS_BATCH = 'experiment-c5-nuclei-optics-reading-20261127'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


EDITIONS = {
    'SIM-C5-L06-01': {
        'points': [90, 270],
        'sourceVersion': 2,
        'prerequisites': ['C5-L03'],
        'interpretation': 'Segui le frecce in P a 90°, 180° e 270°. A 180° i due campi e il flusso istantaneo in P si annullano. Nei due fotogrammi con campi diversi da zero la direzione del flusso è la stessa.',
        'transferPrompt': 'In un’onda piana nel vuoto la componente elettrica in P è 3 sin φ V/m. Alla fase {x}, quale componente magnetica con segno esprimi in nT?',
        'blocks': [
            text('Comincia dalla sonda P. Traccia la direzione di propagazione e due assi trasversali per i campi elettrico e magnetico. Sono perpendicolari fra loro e alla direzione di propagazione. Nel vuoto le due componenti, misurate sugli assi positivi scelti, cambiano segno nello stesso istante. Il rapporto delle loro ampiezze è la velocità della luce.'),
            formula(r'B=\frac{E}{c}=\frac{3\sin\varphi\ \mathrm{V/m}}{3\times10^8\ \mathrm{m/s}}=10^{-8}\sin\varphi\ \mathrm T=10\sin\varphi\ \mathrm{nT}'),
            text('Disegna le frecce in P in tre fotogrammi. A 90° il seno vale 1 e il campo magnetico vale +10 nT. A 180° entrambe le componenti sono nulle in P. A 270° il seno vale −1 e leggi −10 nT. L’ultima freccia magnetica ha la stessa lunghezza della precedente e verso opposto. Si inverte anche il campo elettrico, perciò il verso del prodotto vettoriale che indica la propagazione è lo stesso.'),
            text('Per tornare dalla misura magnetica a quella elettrica usa E = cB. Una componente di −10 nT equivale a −10⁻⁸ T. Moltiplicando per 3 × 10⁸ m/s ottieni −3 V/m. Il segno vale per le componenti orientate, mentre i moduli sono positivi.'),
        ],
    },
    'SIM-C5-L06-02': {
        'points': [4, 3],
        'prerequisites': ['C5-L05'],
        'interpretation': 'Sovrapponi due profili alla stessa scala. I massimi si alzano se aumenta E₀, mentre lo spazio tra le creste resta uguale a frequenza fissata.',
        'transferPrompt': 'A frequenza fissata vari l’ampiezza elettrica da 2 V/m a {x}. Quanto vale il rapporto fra la nuova intensità media e quella di riferimento?',
        'blocks': [
            text('Il banco cambia l’altezza delle oscillazioni di un’onda piana sinusoidale nel vuoto. Poiché il campo magnetico ha ampiezza E₀/c, il flusso di energia coinvolge il prodotto dei due campi. Per onde nelle stesse condizioni e con la stessa forma, il fattore di media su un periodo è comune e si cancella nel rapporto.'),
            formula(r'\frac{I}{I_{\rm rif}}=\left(\frac{E_0}{2\ \mathrm{V/m}}\right)^2'),
            text('Segna sullo stesso profilo l’altezza di riferimento 2 V/m. Aggiungi una traccia di altezza 4 V/m e mantieni ferme le creste lungo l’asse orizzontale. Il rapporto delle altezze è 4/2 = 2, quindi il rapporto delle intensità è 2² = 4. Per 3 V/m il quadrato di 3/2 è 9/4. Poiché 9 = 8 + 1, puoi inserire 2,25.'),
            text('Se parti dal rapporto 9/4, prendi la radice positiva perché E₀ è un’ampiezza. Ne risulta E₀ = (3/2) × 2 V/m = 3 V/m. Nel banco la frequenza resta fissa e c = λf, quindi il profilo più alto ha la stessa lunghezza d’onda.'),
        ],
    },
    'SIM-C5-L06-03': {
        'points': [1, 6],
        'prerequisites': ['C5-L03'],
        'interpretation': 'Posiziona le bande su una retta che conta gli esponenti delle lunghezze misurate in metri. Un passo verso sinistra divide la lunghezza per dieci.',
        'transferPrompt': 'Per la banda «{x}», il banco usa una lunghezza campione di 10⁻¹⁰ m. In che posizione si trova sulla scala log₁₀(λ/m)?',
        'blocks': [
            text('Uno spettro occupa più ordini di grandezza. In una scala lineare, lunghezze come 100 m e 10⁻¹⁰ m sono difficili da rappresentare insieme. La scala del banco divide λ per un metro e colloca il numero puro sull’asse del logaritmo. L’unità di lunghezza resta il metro, mentre la coordinata sull’asse è adimensionale.'),
            formula(r's=\log_{10}(\lambda/(1\ \mathrm m)),\qquad \lambda=10^s\ \mathrm m'),
            text('Scrivi sul disegno il punto zero per 1 m. Per il campione radio, 100 m sono 10² m e collochi il punto due passi a destra. Per il campione dei raggi X, 10⁻¹⁰ m si trova dieci passi a sinistra. I due punti distano 2 − (−10) = 12 passi, quindi le lunghezze differiscono di un fattore 10¹². I valori del banco rappresentano campioni, mentre ciascuna banda copre un intervallo.'),
            text('Nel vuoto la stessa relazione c = λf vale per entrambe. Dividi la stessa c per le due lunghezze per ricavare le frequenze. Il campione X ha la lunghezza più piccola e la frequenza più alta. In figura la griglia dei logaritmi rende leggibile un rapporto che il numero di creste schematiche non rappresenta in scala.'),
        ],
    },
    'SIM-C5-L07-01': {
        'points': [250, 500],
        'prerequisites': ['C5-L06'],
        'interpretation': 'Confronta il numero di cicli disegnati nello stesso tratto. Nel vuoto, raddoppiare la frequenza dimezza la lunghezza d’onda e raddoppia l’energia di ciascun fotone.',
        'transferPrompt': 'Una sorgente monocromatica emette a {x}. Usa h ≃ 4,136 × 10⁻¹⁵ eV·s. Quanti eV trasporta un singolo fotone?',
        'blocks': [
            text('La relazione di Planck associa un’energia a un fotone di frequenza f. Raddoppiare il numero di fotoni a frequenza fissa può aumentare l’energia totale del fascio, mentre l’energia di ciascun fotone resta hf. Qui il controllo modifica f. Prima di moltiplicare ricorda che 1 THz = 10¹² Hz e che Hz significa s⁻¹.'),
            formula(r'E=hf,\quad E(250\ \mathrm{THz})=(4{,}136\times10^{-15}\ \mathrm{eV}\,\mathrm s)(250\times10^{12}\ \mathrm{s}^{-1})=\frac{4{,}136}{4}\ \mathrm{eV}'),
            text('La divisione per quattro si fa con due dimezzamenti. Da 4,136 passi a 2,068, poi a 1,034 eV. A 500 THz moltiplichi per 1/2 e ottieni direttamente 2,068 eV. I decimali usano la costante approssimata assegnata dal banco.'),
            text('Per ritrovare la frequenza partendo da 2,068 eV usa f = E/h. Il rapporto 2,068/4,136 è 1/2, quindi f ≃ (1/2) × 10¹⁵ Hz = 500 THz. Disegna per lo stesso tratto di spazio prima un periodo del profilo a 250 THz e poi due periodi a 500 THz. La maggiore frequenza corrisponde a creste più vicine.'),
        ],
    },
    'SIM-C5-L07-03': {
        'points': [14, 19],
        'prerequisites': ['C5-L06'],
        'interpretation': 'Confronta 13, 14 e 19 eV. Lo zero nel misuratore compare sia sotto soglia, quando l’elettrone resta legato, sia alla soglia, quando il banco dà un elettrone libero con energia cinetica nulla.',
        'transferPrompt': 'Un fotone da {x} incontra il bersaglio del banco, con energia di legame 14 eV. Quanta energia cinetica massima rimane all’elettrone?',
        'blocks': [
            text('Il modello descrive un assorbimento a singolo fotone in un bersaglio con energia di legame 14 eV. Traccia una soglia orizzontale a 14 eV. A 13 eV il fotone non copre il costo di separazione e il banco registra zero uscita. Un eV è già un’unità di energia, quindi puoi fare direttamente confronti e differenze in eV.'),
            formula(r'K_{\max}=E_\gamma-E_{\rm legame}\quad(E_\gamma\ge E_{\rm legame}),\qquad E_{\rm legame}=14\ \mathrm{eV}'),
            text('A 14 eV raggiungi la soglia. Nel modello l’elettrone è libero con K massima zero. A 19 eV dividi la barra grafica in 14 eV necessari alla separazione e 5 eV di energia cinetica massima. Per il problema inverso, se vuoi 5 eV all’uscita aggiungi 14 eV e ricavi 19 eV per il fotone.'),
            text('Qui trascuriamo il rinculo e altri canali. Il valore di soglia riguarda il bersaglio scelto. Nella scena, l’indicatore di elettrone libero distingue la soglia dalla situazione sotto soglia, anche quando il numero accanto all’energia cinetica è lo stesso.'),
        ],
    },
}


NUCLEI_OPTICS = {
    'SIM-C5-L08-01': {
        'points': [7, 8],
        'prerequisites': ['C5-L07'],
        'interpretation': 'Tieni fissi i sei protoni nella figura. Aggiungi un neutrone per volta e aggiorna soltanto il numero di massa.',
        'transferPrompt': 'Un nucleo di carbonio contiene 6 protoni e {x} neutroni. Quale numero di massa scrivi in alto a sinistra di C?',
        'blocks': [
            text('Il carbonio è definito dal numero atomico Z = 6. Pertanto il disegno parte con sei protoni in entrambe le configurazioni. I neutroni aggiungono nucleoni senza cambiare Z. Il numero di massa A conta i nucleoni, mentre la massa misurata in unità atomiche dipende anche dall’energia di legame.'),
            formula(r'A=Z+N,\qquad N=A-Z'),
            text('Completa il primo disegno con sette neutroni. Hai 6 + 7 = 13 nucleoni, perciò scrivi ¹³C. Nella seconda configurazione aggiungi l’ottavo neutrone. Il conto diventa 6 + 8 = 14 e il simbolo è ¹⁴C. Se ti danno direttamente ¹⁴C puoi partire da 14 e sottrarre i 6 protoni per trovare 8 neutroni.'),
            text('In entrambi i disegni i protoni restano sei. Perciò assegnare 14 al numero atomico cambierebbe elemento. Il carbonio-13 è stabile e il carbonio-14 è radioattivo. Il modello di conteggio permette di identificare i nuclei, mentre la stabilità si determina con informazioni sulla struttura nucleare.'),
        ],
    },
    'SIM-C5-L08-03': {
        'points': [1, 2],
        'prerequisites': ['C5-L07'],
        'interpretation': 'Tieni due conti separati mentre leggi la scena. Uno segue il numero dei protoni, l’altro conta tutti i nucleoni del nucleo figlio.',
        'transferPrompt': 'Nel decadimento «{x}», quale valore con segno ottieni sottraendo il numero atomico del nucleo padre da quello del figlio?',
        'blocks': [
            text('Disegna il nucleo padre come un riquadro con due numeri, Z per i protoni e A per tutti i nucleoni. Nel decadimento alfa traccia una freccia in uscita per una particella con due protoni e due neutroni. Sottrai le due quantità dai rispettivi conti. Il nucleo figlio ha due protoni e quattro nucleoni in meno.'),
            formula(r'\alpha\colon\ (Z,A)\to(Z-2,A-4),\qquad \beta^-\colon\ (Z,A)\to(Z+1,A),\qquad \gamma\colon\ (Z,A)\to(Z,A)'),
            text('Nel beta meno sostituisci un neutrone disegnato dentro il nucleo con un protone. Il figlio guadagna un protone e il numero totale di nucleoni è lo stesso. L’elettrone e l’antineutrino prodotti escono. La carica del figlio aumenta di un’unità, bilanciata dalla carica −e dell’elettrone. Per le due consegne inserisci −2 per l’alfa e +1 per il beta meno.'),
            text('Nella transizione gamma esce un fotone e il nucleo perde energia senza cambiare Z o A. Per risalire al padre, inverti la variazione del figlio. Dopo un’alfa aggiungi 2 a Z e 4 ad A, mentre dopo un beta meno sottrai 1 a Z e conserva A.'),
        ],
    },
    'SIM-C5-L09-01': {
        'points': [20, 50],
        'prerequisites': ['C5-L06'],
        'interpretation': 'Disegna la normale nel punto di incidenza. Apri due angoli uguali dai lati opposti della normale e orienta le frecce per distinguere arrivo e partenza della luce.',
        'transferPrompt': 'Un raggio arriva su uno specchio piano con un angolo di {x} rispetto alla normale. Qual è l’apertura tra il segmento che torna alla sorgente e il raggio riflesso?',
        'blocks': [
            text('Nel punto in cui il raggio incontra lo specchio, traccia la retta perpendicolare alla superficie. L’incidenza e la riflessione si misurano da questa normale. Per costruire l’apertura, parti dal punto di incidenza lungo il segmento rivolto alla sorgente. Poi attraversa la normale fino al raggio riflesso.'),
            formula(r'\theta_r=\theta_i,\qquad \alpha=\theta_i+\theta_r=2\theta_i'),
            text('Nel primo disegno i due settori sono da 20° e 20°, quindi l’apertura vale 40°. Nel secondo sono da 50° e 50°, quindi vale 100°. Se l’apertura è 100°, dividila in due settori uguali per risalire all’incidenza di 50°.'),
            text('A incidenza normale il raggio ripercorre il segmento verso la sorgente e l’apertura così costruita è zero. Le frecce dei due raggi sono allora opposte perché indicano i versi della luce. Il valore richiesto riguarda i due segmenti che partono geometricamente dal punto di incidenza.'),
        ],
    },
    'SIM-C5-L10-01': {
        'points': [5, 20],
        'prerequisites': ['C5-L09'],
        'interpretation': 'Lascia i raggi in ingresso paralleli e disegna il loro incontro sul lato opposto della lente. Il fuoco più vicino corrisponde a più diottrie.',
        'transferPrompt': 'Una lente convergente sottile mette a fuoco raggi paralleli a {x}. Quale potere ottico ha in diottrie?',
        'blocks': [
            text('Nel modello di lente sottile l’asse ottico passa per il centro della lente. Raggi paralleli e vicini all’asse si incontrano nel fuoco immagine. Segna in figura la distanza f dal piano della lente al fuoco. Un fuoco più vicino indica che i raggi si inclinano di più e che la lente ha potere maggiore.'),
            formula(r'D=\frac{1}{f\ \text{in metri}},\qquad 1\ \text{diottria}=1\ \mathrm m^{-1}'),
            text('La prima distanza è 5 cm, cioè 5/100 m = 1/20 m. Il reciproco vale 20 diottrie. Nella seconda traccia il fuoco è a 20 cm, cioè 20/100 m = 1/5 m. Il reciproco vale 5 diottrie. Se leggi 5 diottrie, il reciproco 1/5 m riporta a 20 cm.'),
            text('Puoi controllare il calcolo con i rapporti. Il secondo fuoco è quattro volte più lontano e il secondo potere è un quarto del primo. Il potere è positivo nella convenzione del banco perché la lente è convergente. Invertire il numero in centimetri senza la conversione consegnerebbe un valore in cm⁻¹.'),
        ],
    },
    'SIM-C5-L10-02': {
        'points': [5, 20],
        'formula': '1/q = 1/(0,10 m) − 1/p, con p e q espressi in metri',
        'prerequisites': ['C5-L09'],
        'interpretation': 'Sposta l’oggetto da prima del fuoco a oltre il fuoco. Per leggere il segno di 1/q cerca l’incontro dei raggi oppure il punto in cui si incontrano i loro prolungamenti.',
        'transferPrompt': 'L’oggetto è a {x} da una lente sottile convergente con f = 10 cm. Qual è la vergenza dell’immagine 1/q con segno, in diottrie?',
        'blocks': [
            text('Disegna la lente e segna i due fuochi a 10 cm. Prendi p positivo per l’oggetto reale e q positivo per un’immagine dalla parte dei raggi emergenti. Dal vertice dell’oggetto traccia il raggio centrale e quello parallelo all’asse. Quest’ultimo, dopo la lente, passa per il fuoco immagine. La loro costruzione giustifica la relazione paraassiale della lente sottile.'),
            formula(r'\frac{1}{q}=\frac{1}{f}-\frac{1}{p},\qquad f=\frac{1}{10}\ \mathrm m'),
            text('Per p = 5 cm hai p = 1/20 m. Ottieni 1/q = 10 − 20 = −10 diottrie. I raggi divergono e i loro prolungamenti si incontrano dal lato dell’oggetto a q = −1/10 m. Per p = 20 cm usi p = 1/5 m e trovi 1/q = 10 − 5 = +5 diottrie. I raggi convergono dal lato opposto a q = 1/5 m.'),
            text('Al fuoco p = f i due reciproci si cancellano. La risultante è zero e i raggi emergono paralleli, con immagine all’infinito. Se parti da una vergenza immagine di +5 diottrie, la formula inversa dà 1/p = 10 − 5 = 5 m⁻¹, quindi p = 20 cm. Cambiare segno sulla vergenza cambierebbe anche il lato attribuito all’immagine.'),
        ],
    },
}


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


def assemble(source_file, batch_directory, batch=BATCH, editions=EDITIONS):
    sources = {row['id']: row for row in json.loads(source_file.read_bytes())}
    records, bindings = [], []
    for activity_id, edition in editions.items():
        source = sources[activity_id]
        version = edition.get('sourceVersion', 1)
        if (source['version'], source['kind'], source['course']) != (version, 'experiment', 'C5'):
            raise ValueError(f'Unexpected source edition for {activity_id}')
        record = {
            **source,
            **{key: value for key, value in edition.items() if key not in ('points', 'sourceVersion')},
            'assessmentSelection': {'schemaVersion': '1.0.0', 'points': edition['points']},
            'baseVersion': version,
            'version': version + 1,
            'review': 'Candidata DRAFT. Revisione distinta e approvazione umana in attesa.',
        }
        records.append(record)
        bindings.append({
            'id': activity_id, 'sourceId': activity_id, 'sourceRef': SOURCE_REF,
            'sourceSha256': digest(source), 'candidateSha256': digest(record), 'assetChecksums': {},
        })
    write(batch_directory / f'{batch}.json', {'schema': 'astra/1', 'records': records, 'assets': []})
    write(batch_directory / f'{batch}-bindings.json', bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_file', type=Path)
    parser.add_argument('batch_directory', type=Path)
    parser.add_argument('--nuclei-optics', action='store_true')
    arguments = parser.parse_args()
    batch, editions = (NUCLEI_OPTICS_BATCH, NUCLEI_OPTICS) if arguments.nuclei_optics else (BATCH, EDITIONS)
    assemble(arguments.source_file, arguments.batch_directory, batch, editions)
