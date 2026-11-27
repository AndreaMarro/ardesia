"""Assemble the C5 field, spectrum and photon draft editions from immutable source editions.

Use the canonical astra/1 importer for persistence. This authoring script confers
no scientific acceptance and writes no central ledger entries.
"""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c5-field-spectrum-photon-reading-20261127'


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


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


def assemble(source_file, batch_directory):
    sources = {row['id']: row for row in json.loads(source_file.read_bytes())}
    records, bindings = [], []
    for activity_id, edition in EDITIONS.items():
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
    write(batch_directory / f'{BATCH}.json', {'schema': 'astra/1', 'records': records, 'assets': []})
    write(batch_directory / f'{BATCH}-bindings.json', bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_file', type=Path)
    parser.add_argument('batch_directory', type=Path)
    arguments = parser.parse_args()
    assemble(arguments.source_file, arguments.batch_directory)
