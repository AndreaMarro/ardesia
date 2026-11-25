"""Additive Stevino edition: one stated gravity, exact manual assigned arithmetic.

Authoring only. Independent scientific review, visual acceptance and publication
are separate gates; the original published edition is retained verbatim.
"""
import json
from pathlib import Path
from .pipeline import canonical, digest, git_bytes
from .units_authoring import text, law_steps

BATCH = 'experiment-stevino-revision-047'
KEY = 'SIM-C2-L002-01'
SOURCE_PATH = 'officina-di-fisica/content/esperienze-C2.json'


def assemble(repo, source_ref):
    old = next(row for row in json.loads(git_bytes(repo, source_ref, SOURCE_PATH)) if row['id'] == KEY)
    row = {
        **old,
        'version': old['version'] + 1,
        'baseVersion': old['version'],
        'formula': 'Δp = ρgh, con ρ = 1000 kg/m³ e g = 981/100 m/s²',
        'transferPrompt': 'Un sensore azzerato in superficie viene immerso a {x} nell’acqua. Di quanti kPa sale la lettura usando g = 981/100 m/s²? Mantieni esatte le frazioni durante il conto.',
        'assessmentSelection': {'schemaVersion': '1.0.0', 'points': [2, 1.5]},
        'prerequisites': ['C2-L001'],
        'review': 'Candidata DRAFT; verifica scientifica distinta NOT_RUN; approvazione umana NOT_RUN.',
        'blocks': [
            text('La vasca contiene acqua ferma e omogenea, di densità ρ=1000 kg/m³. Usiamo in tutta questa esperienza la stessa gravità g=981/100 m/s², cioè 9,81 m/s². Il manometro è azzerato al pelo libero: misura la pressione in più rispetto alla superficie, non la pressione assoluta. Immagina di confrontare due quote nella stessa acqua: la differenza nasce dal peso della colonna liquida fra le due quote.'),
            text('Per capire quale legge scegliere, isola idealmente una colonna verticale di area A e altezza h. Il suo volume è Ah, la sua massa è ρAh e il suo peso è ρAhg. In equilibrio, la forza di pressione alla base supera quella alla sommità proprio di questo peso. Dividendo per la medesima area A, questa area si semplifica: conta la profondità verticale, non la larghezza della colonna. Questa costruzione assume acqua in quiete, densità uniforme e gravità costante; non descrive getti o differenze di velocità.'),
            *law_steps(r'(p_{\rm base}-p_{\rm superficie})A=\rho Ahg'),
            *law_steps(r'\Delta p=\rho gh'),
            text('Controlla le unità prima di moltiplicare: (kg/m³)(m/s²)m=kg/(m s²)=Pa. Mille pascal fanno un kilopascal. La densità 1000 introduce quindi un fattore 1000 e la conversione da Pa a kPa lo elimina. Per l’acqua del modello, ogni metro di profondità aggiunge esattamente 981/100 kPa. Le letture decimali del banco sono osservazioni; i due calcoli assegnati usano soltanto raddoppio, dimezzamento e frazioni.'),
            *law_steps(r'\Delta p=\frac{981}{100}\,\frac{\mathrm{kPa}}{\mathrm m}\,h'),
            text('Nel primo controllo porta la sonda a h=2 m. Raddoppia 981: ottieni 1962. Dividi per 100 spostando la virgola di due posizioni: 19,62 kPa. La pressione cresce andando verso il basso. Non devi aggiungere la pressione atmosferica perché lo strumento è già azzerato alla superficie.'),
            *law_steps(r'\Delta p(2\,\mathrm m)=\frac{981\cdot2}{100}\,\mathrm{kPa}'),
            *law_steps(r'\Delta p(2\,\mathrm m)=\frac{1962}{100}\,\mathrm{kPa}=19{,}62\,\mathrm{kPa}'),
            text('Per il trasferimento h=1,5 m è 3/2 m. Moltiplica 981 per 3: 981+981+981=2943. Il denominatore diventa 100·2=200, quindi la risposta esatta è 2943/200 kPa. Se vuoi inserirla in forma decimale, moltiplica numeratore e denominatore per 5: 14715/1000=14,715 kPa. Un controllo mentale alternativo è sommare la lettura a 1 m, 9,81 kPa, e la sua metà, 4,905 kPa.'),
            *law_steps(r'\Delta p\left(\frac32\,\mathrm m\right)=\frac{981}{100}\cdot\frac32\,\mathrm{kPa}'),
            *law_steps(r'\Delta p\left(\frac32\,\mathrm m\right)=\frac{2943}{200}\,\mathrm{kPa}=14{,}715\,\mathrm{kPa}'),
            text('Puoi invertire la legge per ricavare la profondità: prima sottrai la pressione di superficie, poi dividi per ρg. Se usi i pascal, h=Δp/(ρg). Con la sovrapressione 19,62 kPa trasformata in 19620 Pa, il denominatore è 1000·981/100=9810 Pa/m; 19620/9810=2 m. Dividere la pressione assoluta senza sottrarre quella di superficie aggiungerebbe una colonna d’acqua inesistente.'),
            *law_steps(r'h=\frac{\Delta p}{\rho g}\quad(\rho>0,\ g>0)'),
            text('A h=0 la sovrapressione è nulla; raddoppiare h raddoppia Δp nella stessa acqua. Due sonde alla stessa quota nello stesso liquido collegato devono dare la medesima pressione anche se la vasca cambia forma. Usare 10 al posto di 9,81 darebbe 20 kPa nel primo controllo e 15 kPa nel trasferimento: sono risultati di un modello con una gravità diversa, non arrotondamenti delle risposte richieste qui. Confrontare 15 con 14,715 aiuta a riconoscere proprio questo scambio di ipotesi.'),
        ],
    }
    binding = {'id': KEY, 'sourceId': KEY, 'sourceSha256': digest(old),
               'sourceRef': source_ref, 'candidateSha256': digest(row), 'assetChecksums': {}}
    return {'schema': 'astra/1', 'records': [row], 'assets': []}, [binding]


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--source-ref', required=True)
    parser.add_argument('--destination', type=Path, required=True)
    args = parser.parse_args()
    args.destination.mkdir(parents=True, exist_ok=True)
    package, bindings = assemble(args.repo, args.source_ref)
    for suffix, value in [('', package), ('-bindings', bindings)]:
        (args.destination / (BATCH + suffix + '.json')).write_text(canonical(value) + '\n')
