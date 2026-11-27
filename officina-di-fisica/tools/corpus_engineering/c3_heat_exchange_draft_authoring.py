"""Assemble the individually authored C3 heat-exchange draft editions."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering.pipeline import digest


SOURCE_REF = '5d1dc8dc7b601aef959d10d564c75462be74708d'
BATCH = 'experiment-c3-heat-exchange-reading-20261127'


def text(value):
    return {'type': 'text', 'text': value}


def formula(value):
    return {'type': 'formula', 'text': value}


EDITIONS = {
    'SIM-C3-L05-01': {
        'points': [2, 8],
        'transferPrompt': 'Una parete di spessore {x} e area 0,01 m² ha k = 1 W/(m·K). Le due facce differiscono di 20 K. Quale potenza termica attraversa la parete?',
        'blocks': [
            text('Segna la faccia calda e quella fredda dello stesso materiale. Nella conduzione stazionaria monodimensionale, con conducibilità costante e perdite laterali trascurate, la temperatura cambia linearmente nello spessore. La pendenza del profilo vale ΔT/L in modulo. Il flusso di calore va dalla faccia più calda a quella più fredda.'),
            formula(r'P=kA\frac{\Delta T}{L},\quad kA\Delta T=(1\ \mathrm{W/(m\,K)})(0{,}01\ \mathrm{m^2})(20\ \mathrm K)=0{,}20\ \mathrm{W\,m}'),
            text('Disegna i due profili con la stessa differenza di temperatura. A 2 cm, cioè 0,02 m, il conto è 0,20/0,02 = 20/2 = 10 W. Con 8 cm, cioè 0,08 m, dividi 20 per 8 e ottieni 5/2 = 2,5 W. La seconda pendenza è un quarto della prima perché lo spessore è quadruplicato.'),
            text('Per risalire allo spessore inverti la legge. Con P = 2,5 W, dividi 0,20 W·m per 2,5 W e trovi 0,08 m, pari a 8 cm. La misura è in watt perché il kelvin si cancella nella legge e dopo la divisione dei metri rimane soltanto la potenza.'),
        ],
    },
    'SIM-C3-L05-02': {
        'points': [2, 3.5],
        'transferPrompt': 'Nello scambiatore passano {x} d’acqua. Ogni grammo cede 42 J all’altro circuito. Quanti watt trasferisce l’acqua?',
        'blocks': [
            text('Segui una piccola massa d’acqua dall’ingresso caldo all’uscita più fredda. La portata dice quanti grammi attraversano la sezione ogni secondo. Se ciascun grammo si raffredda di 10 K, cede 4,2 J/(g·K) × 10 K = 42 J/g. Il conto vale per un flusso stazionario senza cambiamento di fase e con calore specifico preso costante.'),
            formula(r'P=\dot m c\Delta T=\dot m(42\ \mathrm{J/g})'),
            text('Disegna una freccia per il flusso d’acqua e una seconda dal circuito caldo a quello freddo per il calore ceduto. A 2 g/s transitano due porzioni da un grammo ogni secondo. Due volte 42 danno 84 J/s, cioè 84 W. A 3,5 g/s moltiplica per 3 + 1/2 e somma 126 + 21 = 147 W.'),
            text('Per ricavare la portata da una potenza di 147 W, dividi 147 J/s per 42 J/g. Ne risultano 7/2 g/s. Il grammo si cancella nella legge diretta e ricompare in quella inversa. A pari raffreddamento, il maggior trasferimento deriva da più acqua che attraversa il circuito nello stesso tempo.'),
        ],
    },
    'SIM-C3-L05-03': {
        'points': [200, 400],
        'formula': 'P/A = εσ(T⁴ − Tₐ⁴), con ε = 1, Tₐ = 300 K e σ ≃ 5,67 × 10⁻⁸ W/(m²·K⁴)',
        'transferPrompt': 'Una piastra nera a {x} scambia radiazione con un grande ambiente nero a 300 K. Qual è il flusso radiativo netto per metro quadrato, positivo se esce dalla piastra?',
        'blocks': [
            text('Disegna due frecce opposte. La piastra emette verso l’ambiente e l’ambiente stesso irradia verso la piastra. Nel modello nero e con tutta la vista occupata da un ambiente uniforme, il flusso netto uscente è la differenza fra quei due contributi. Usa temperature assolute in kelvin e trascura gli altri canali di scambio.'),
            formula(r'j=\sigma(T^4-T_a^4),\qquad T_a=300\ \mathrm K,\qquad \sigma\simeq5{,}67\times10^{-8}\ \mathrm{W\,m^{-2}\,K^{-4}}'),
            text('A 200 K raccogli 100⁴ = 10⁸ K⁴. Rimane 2⁴ − 3⁴ = 16 − 81 = −65. Il fattore 10⁸ cancella quello nella costante. Per moltiplicare 5,67 per 65, somma 5,67 × 60 = 340,2 e 5,67 × 5 = 28,35. Con il segno ottieni −368,55 W/m². Nella figura prevale la freccia entrante.'),
            text('A 400 K il fattore intero diventa 4⁴ − 3⁴ = 256 − 81 = 175. Fai 5,67 × (200 − 25). Da 1.134 togli 141,75, che è un quarto di 567. Rimangono 992,25 W/m² e prevale la freccia uscente. A 300 K le due frecce hanno uguale modulo. Il flusso netto è zero benché continuino entrambi gli scambi.'),
            text('Per isolare la temperatura, somma Tₐ⁴ a j/σ e prendi la radice quarta positiva. Per trovare l’equilibrio basta porre j = 0. Ottieni T⁴ = Tₐ⁴ e quindi T = 300 K, senza calcolare alcuna radice numerica.'),
        ],
    },
}


def write(path, payload):
    path.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')


def assemble(original, directory):
    sources = {row['id']: row for row in json.loads(original.read_bytes())}
    records, bindings = [], []
    for key, edition in EDITIONS.items():
        source = sources[key]
        if (source['kind'], source['course'], source['version']) != ('experiment', 'C3', 1):
            raise ValueError('Unexpected source edition: ' + key)
        record = {
            **source, **{field: value for field, value in edition.items() if field != 'points'},
            'prerequisites': ['C3-L05'], 'baseVersion': 1, 'version': 2,
            'review': 'Candidata DRAFT. Revisione distinta e approvazione umana in attesa.',
            'assessmentSelection': {'schemaVersion': '1.0.0', 'points': edition['points']},
        }
        bindings.append({'id': key, 'sourceId': key, 'sourceRef': SOURCE_REF,
                         'sourceSha256': digest(source), 'candidateSha256': digest(record), 'assetChecksums': {}})
        records.append(record)
    write(directory/(BATCH+'.json'), {'schema':'astra/1','assets':[],'records':records})
    write(directory/(BATCH+'-bindings.json'), bindings)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('original', type=Path)
    parser.add_argument('directory', type=Path)
    args = parser.parse_args()
    assemble(args.original, args.directory)
