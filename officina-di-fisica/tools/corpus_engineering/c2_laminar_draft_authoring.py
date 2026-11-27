"""Reproduce the five individually authored C2 laminar-flow draft editions."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c2-laminar-viscosity-reading-20261127'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


EDITIONS = {
    'SIM-C2-L007-01': {
        'points': [0.15, 0.4],
        'transferPrompt': 'Acqua di densità 1.000 kg/m³ e viscosità 0,001 Pa·s percorre un tubo di diametro 1 cm a {x}. Quale numero di Reynolds ottieni?',
        'blocks': [
            text('Il numero di Reynolds confronta gli effetti dell’inerzia con quelli della viscosità. Nel tubo si usa la velocità media sulla sezione e il diametro interno. Per l’acqua del modello prendi ρ = 1.000 kg/m³ ed η = 10⁻³ Pa·s. Il diametro è 1 cm = 10⁻² m.'),
            formula(r'\mathrm{Re}=\frac{\rho vD}{\eta}=(10^4\ \mathrm{s/m})v'),
            text('Per ritrovare il fattore, moltiplica le potenze 10³ e 10⁻², poi dividi per 10⁻³. L’esponente finale è 3 − 2 + 3 = 4. Le unità di ρvD sono kg/(m·s), le stesse di Pa·s, quindi Reynolds è adimensionale. A 0,15 m/s leggi 1.500 e a 0,40 m/s leggi 4.000.'),
            text('Disegna il diametro e la freccia della velocità media. A 1.500 aggiungi un profilo laminare parabolico al banco. A 4.000 il banco ritira quel profilo perché sarebbe fuori dal dominio scelto. Dividendo 2.300 per 10.000 trovi 0,23 m/s, una soglia orientativa del modello per il tubo, sensibile alle condizioni di ingresso e alle perturbazioni.'),
        ],
    },
    'SIM-C2-L007-02': {
        'points': [1, 2],
        'transferPrompt': 'La sonda resta a metà raggio in un flusso laminare stazionario. Il profilo è parabolico e al centro l’acqua scorre a 8 cm/s. Al tempo {x}, quale velocità locale misuri?',
        'blocks': [
            text('Tieni fermo un punto nello spazio e confronta le sue letture in istanti diversi. Nel moto stazionario la velocità a quel punto resta costante nel tempo. In un profilo parabolico la velocità cambia da un raggio a un altro, quindi occorre fissare la sonda prima del confronto.'),
            formula(r'v(R/2)=v(0)\left[1-(1/2)^2\right]=(8\ \mathrm{cm/s})\frac34=6\ \mathrm{cm/s}'),
            text('Disegna la sezione di misura con una tacca a metà raggio. Un mezzo al quadrato dà un quarto. Togli quel quarto dall’intero e rimangono tre quarti. Fai 8/4 = 2, poi 2 × 3 = 6. Leggi dunque 6 cm/s sia a un secondo sia a due secondi.'),
            text('Nel disegno successivo la sonda è nello stesso punto e il tracciante rosso si è spostato. A metà raggio percorre altri 6 cm in un secondo, anche se la lettura locale resta uguale. Se conosci soltanto 6 cm/s a metà raggio, risali al valore sull’asse moltiplicando per 4/3 e torni a 8 cm/s.'),
        ],
    },
    'SIM-C2-L007-03': {
        'points': [0.5, 1.5],
        'formula': 'τ = η dv/dy, con dv/dy = 4 s⁻¹',
        'transferPrompt': 'Il gradiente resta 4 s⁻¹ fra le lastre. Con una viscosità di {x}, quale sforzo di taglio ottieni per il fluido newtoniano?',
        'blocks': [
            text('Considera strati di fluido tra due lastre che scorrono l’una rispetto all’altra. Per un fluido newtoniano la forza tangenziale per area è proporzionale al gradiente di velocità. Il banco tiene fermo il gradiente e cambia soltanto la viscosità, come quando si mantiene la stessa pendenza ma il liquido oppone una resistenza diversa.'),
            formula(r'\tau=\eta\frac{dv}{dy},\qquad \frac{dv}{dy}=4\ \mathrm{s^{-1}}'),
            text('Disegna le stesse frecce di velocità tra le lastre per entrambi i liquidi. Cambia la freccia dello sforzo. Per 0,5 Pa·s moltiplica 4 per un mezzo e trovi 2 Pa. Per 1,5 Pa·s moltiplica 4 per 1 + 1/2 e trovi 4 + 2 = 6 Pa. Nel prodotto Pa·s × s⁻¹ resta il pascal, uguale a N/m².'),
            text('Per stimare η da uno sforzo di 6 Pa, dividi per 4 s⁻¹. Ottieni 6/4 Pa·s = 3/2 Pa·s. Le velocità degli strati possono essere uguali nei due esperimenti e gli sforzi diversi, perché è diversa la risposta viscosa del fluido.'),
        ],
    },
    'SIM-C2-L007-04': {
        'points': [2, 5],
        'transferPrompt': 'Le due lastre distano {x}. Quella superiore scorre a 40 mm/s e quella inferiore è ferma. Quale gradiente trovi per un profilo lineare?',
        'blocks': [
            text('Usa l’asse y per misurare l’altezza dal basso verso l’alto e disegna la velocità orizzontale rispetto a quest’asse. Per un profilo lineare la pendenza è il salto di velocità fra le lastre diviso per la distanza. Il salto è 40 mm/s in entrambe le configurazioni.'),
            formula(r'\frac{dv}{dy}=\frac{\Delta v}{h}=\frac{40\ \mathrm{mm/s}}{h}'),
            text('Con le lastre a 2 mm, distribuisci il salto di 40 su due millimetri. Il gradiente vale 20 s⁻¹. A 5 mm, dividi 40 per 5 e trovi 8 s⁻¹. I millimetri si cancellano perché le due lunghezze usano la stessa unità. Traccia i due profili con lo stesso salto di velocità e altezze diverse per confrontare le pendenze.'),
            text('Per calcolare la distanza necessaria a ottenere 8 s⁻¹, inverti il rapporto. Dividi 40 mm/s per 8 s⁻¹ e trovi 5 mm. Il gradiente positivo indica che la velocità cresce con y. Una lastra più lontana distribuisce lo stesso salto su più spazio.'),
        ],
    },
    'SIM-C2-L007-05': {
        'points': [0.5, 1],
        'formula': 'v(r) = (12 cm/s) [1 − (r/R)²]',
        'transferPrompt': 'In un tubo con profilo laminare parabolico la velocità sull’asse è 12 cm/s. Se r/R vale {x}, quale velocità locale misuri?',
        'blocks': [
            text('Nel tubo circolare con moto laminare pienamente sviluppato, la velocità va misurata a una distanza r dall’asse. Parti con la freccia più lunga sull’asse e riducila seguendo la parabola. Alla parete ferma la condizione di aderenza dà velocità nulla.'),
            formula(r'v(r)=12\ \mathrm{cm/s}\left[1-(r/R)^2\right]'),
            text('A r/R = 1/2 la parte sottratta vale 1/4. Rimangono 3/4 della velocità di asse. Dividi 12 per 4, poi moltiplica 3 per 3. Leggi 9 cm/s. Alla parete r/R = 1 e la parentesi vale 1 − 1 = 0. Nella figura segna i tre raggi 0, R/2 e R prima di unire le punte delle frecce.'),
            text('Se trovi 9 cm/s, separa il profilo dal fattore 12. Hai v/12 = 3/4, quindi (r/R)² = 1 − 3/4 = 1/4. La distanza radiale è positiva o nulla e la radice dà r/R = 1/2. A metà raggio la velocità è quindi tre quarti di quella sull’asse, come mostra il profilo curvo.'),
        ],
    },
}


def assemble(source_file, directory):
    sources = {row['id']: row for row in json.loads(source_file.read_bytes())}
    records, bindings = [], []
    for key, authored in EDITIONS.items():
        source = sources[key]
        if (source['version'], source['kind'], source['course']) != (1, 'experiment', 'C2'):
            raise ValueError('Unexpected immutable source ' + key)
        record = {**source, 'baseVersion': 1, 'version': 2, 'prerequisites': ['C2-L007'],
                  'transferPrompt': authored['transferPrompt'], 'blocks': authored['blocks'],
                  'formula': authored.get('formula', source['formula']),
                  'assessmentSelection': {'schemaVersion': '1.0.0', 'points': authored['points']},
                  'review': 'Candidata DRAFT. Revisione distinta e approvazione umana in attesa.'}
        records.append(record)
        bindings.append({'id': key, 'sourceId': key, 'sourceRef': SOURCE_REF,
                         'sourceSha256': digest(source), 'candidateSha256': digest(record), 'assetChecksums': {}})
    write(directory/(BATCH+'.json'), {'schema': 'astra/1', 'records': records, 'assets': []})
    write(directory/(BATCH+'-bindings.json'), bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_file', type=Path)
    parser.add_argument('batch_directory', type=Path)
    args = parser.parse_args()
    assemble(args.source_file, args.batch_directory)
