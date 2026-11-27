"""Author an astra/1 correction to the heat capacity experiment's comparison."""

import argparse
import json
from pathlib import Path

from .pipeline import canonical, digest, git_bytes


BATCH = 'experiment-heat-capacity-revision-264'
SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH = 'officina-di-fisica/content/esperienze-C3.json'
ID = 'SIM-C3-L03-02'

INTERPRETATION = (
    'Stiamo confrontando due quantità dello stesso materiale. Il calore specifico resta '
    '0,4 J/(g·K). Per aumentare la temperatura di 1 K occorrono 40 J con 100 g '
    'e 100 J con 250 g. La massa è diventata 5/2 di quella iniziale e l’energia '
    'necessaria cresce dello stesso fattore.'
)

BLOCKS = [
    {'type': 'text', 'text': 'Imposta 100 g nel calorimetro, poi porta il cursore a 250 g. In entrambe le prove il materiale è lo stesso. Il modello considera il calore assorbito dal campione e assume un calore specifico costante nel piccolo intervallo di temperatura. Per un intervallo di 1 K, il valore della capacità termica in J/K indica quanti joule servono al campione.'},
    {'type': 'formula', 'text': r'C=mc,\qquad Q=C\,\Delta T'},
    {'type': 'text', 'text': 'Per il conto a mano scrivi 0,4 come due quinti. Dividi la massa per cinque e poi raddoppia. Con 100 g ottieni 20 e poi 40 J/K. Con 250 g ottieni 50 e poi 100 J/K. Nei prodotti si cancellano i grammi. A parità di aumento di temperatura il rapporto fra i calori è 100/40, cioè 5/2, come 250/100 per le masse.'},
    {'type': 'formula', 'text': r'\frac{C_{250}}{C_{100}}=\frac{250}{100}=\frac52'},
    {'type': 'text', 'text': 'Ora sposta il cursore a 175 g. Un quinto è 35 g, quindi la capacità termica vale 70 J/K. Puoi risalire alla massa dividendo 70 J/K per 0,4 J/(g·K), cioè moltiplicando per 5/2. Ottieni 175 g, come indicava il cursore. Il valore per grammo resta 0,4 J/(g·K) anche quando cambia la capacità del pezzo intero.'},
    {'type': 'formula', 'text': r'm=\frac{C}{c}=70\cdot\frac52\,\mathrm g=175\,\mathrm g'},
]


def assemble(repo):
    originals = json.loads(git_bytes(repo, SOURCE_REF, SOURCE_PATH))
    source = next(row for row in originals if row['id'] == ID)
    assert source['version'] == 1 and source['references'] == [[100, 40], [250, 100]]
    edition = {**source, 'baseVersion': 1, 'version': 2, 'interpretation': INTERPRETATION, 'blocks': BLOCKS,
               'review': 'Bozza da verificare con un revisore distinto dall’autore.'}
    binding = {'id': ID, 'sourceId': ID, 'sourceRef': SOURCE_REF, 'sourceSha256': digest(source),
               'candidateSha256': digest(edition), 'assetChecksums': {}}
    return {'schema': 'astra/1', 'records': [edition], 'assets': []}, [binding]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--destination', type=Path, required=True)
    args = parser.parse_args()
    package, bindings = assemble(args.repo)
    args.destination.mkdir(parents=True, exist_ok=True)
    (args.destination / (BATCH + '.json')).write_text(canonical(package) + '\n')
    (args.destination / (BATCH + '-bindings.json')).write_text(canonical(bindings) + '\n')
